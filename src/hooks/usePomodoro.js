/* ============================================================
   usePomodoro — Core timer logic + localStorage persistence
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEYS = {
  settings: 'ag-pomodoro-settings',
  history: 'ag-pomodoro-history',
  sound: 'ag-pomodoro-sound',
};

const DEFAULT_SETTINGS = {
  focus: 25,
  short: 5,
  long: 15,
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded – silently ignore */ }
}

// Tiny beep synthesised via Web Audio API
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
    osc.onended = () => ctx.close();
  } catch { /* AudioContext not available */ }
}

const MODE_LABELS = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };

export function usePomodoro() {
  const [settings, setSettings] = useState(() =>
    loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    loadFromStorage(STORAGE_KEYS.sound, true)
  );
  const [history, setHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.history, [])
  );

  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(() =>
    loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS).focus * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Refs to avoid stale closures in intervals
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const soundEnabledRef = useRef(soundEnabled);
  const historyAddRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Persist to localStorage
  useEffect(() => { saveToStorage(STORAGE_KEYS.settings, settings); }, [settings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.sound, soundEnabled); }, [soundEnabled]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.history, history); }, [history]);

  const addHistoryEntry = useCallback((status, elapsed, entryMode, entrySettings) => {
    const m = entryMode || modeRef.current;
    const s = entrySettings || settingsRef.current;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode: m,
      modeLabel: MODE_LABELS[m],
      totalDuration: s[m],
      completedSeconds: elapsed,
      status,
    };
    setHistory(prev => [entry, ...prev].slice(0, 100));
  }, []);

  // Keep addHistoryEntry in a ref for use in interval
  useEffect(() => { historyAddRef.current = addHistoryEntry; }, [addHistoryEntry]);

  // Countdown tick — uses refs to avoid stale data
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Session completed — schedule side effects outside setState
          setTimeout(() => {
            const elapsed = sessionStartRef.current
              ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
              : settingsRef.current[modeRef.current] * 60;
            historyAddRef.current('completed', elapsed);
            sessionStartRef.current = null;
            if (soundEnabledRef.current) playBeep();
            setIsRunning(false);
            setHasStarted(false);
            setTimeLeft(settingsRef.current[modeRef.current] * 60);
          }, 0);
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Actions
  const start = useCallback(() => {
    sessionStartRef.current = Date.now();
    setHasStarted(true);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setHasStarted(false);
    sessionStartRef.current = null;
    setTimeLeft(settingsRef.current[modeRef.current] * 60);
  }, []);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    const elapsed = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;
    setIsRunning(false);
    if (sessionStartRef.current) {
      addHistoryEntry('skipped', elapsed);
    }
    sessionStartRef.current = null;
    setHasStarted(false);
    setTimeLeft(settingsRef.current[modeRef.current] * 60);
  }, [addHistoryEntry]);

  const switchMode = useCallback((newMode) => {
    clearInterval(intervalRef.current);
    if (sessionStartRef.current) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (elapsed > 5) addHistoryEntry('skipped', elapsed);
      sessionStartRef.current = null;
    }
    setIsRunning(false);
    setHasStarted(false);
    setMode(newMode);
    // Use settingsRef for the current persisted settings
    setTimeLeft(settingsRef.current[newMode] * 60);
  }, [addHistoryEntry]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    settingsRef.current = newSettings;
    // Only update timer if not running
    setIsRunning(prev => {
      if (!prev) {
        setTimeLeft(newSettings[modeRef.current] * 60);
      }
      return prev;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const totalSeconds = settings[mode] * 60;
  const progress = totalSeconds > 0 ? 1 - (timeLeft / totalSeconds) : 0;

  return {
    // State
    mode, timeLeft, isRunning, progress, settings, soundEnabled, history, hasStarted,
    // Actions
    start, pause, resume, reset, skip, switchMode,
    updateSettings, setSoundEnabled, clearHistory,
  };
}
