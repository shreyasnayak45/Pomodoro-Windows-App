/* ============================================================
   App — Root component assembling all panels
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { usePomodoro } from './hooks/usePomodoro';
import ModeSelector from './components/ModeSelector';
import CircularProgress from './components/CircularProgress';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import SettingsPanel from './components/SettingsPanel';
import SessionHistory from './components/SessionHistory';
import styles from './App.module.css';

// Icon: Gear
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
    </svg>
  );
}

// Icon: Sound on
function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

// Icon: Sound off
function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );
}

// Icon: History
function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
    </svg>
  );
}

const MODE_TAGLINES = {
  focus: 'Stay in the zone.',
  short: 'Take a breath.',
  long:  'You earned it.',
};

export default function App() {
  const pomodoro = usePomodoro();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const {
    mode, timeLeft, isRunning, progress, settings, soundEnabled, history, hasStarted,
    start, pause, resume, reset, skip, switchMode,
    updateSettings, setSoundEnabled, clearHistory,
  } = pomodoro;

  // Sync mode to body for background orb theming
  useEffect(() => {
    document.body.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <div className={styles.app} data-mode={mode}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="./icon.png" alt="Pomodoro Icon" className={styles.brandIcon} />
          <span className={styles.brandName}>Pomodoro</span>
        </div>
        <div className={styles.headerActions}>
          <button
            id="btn-toggle-sound"
            className={`${styles.iconBtn} ${soundEnabled ? styles.soundOn : ''}`}
            onClick={() => setSoundEnabled(v => !v)}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button
            id="btn-toggle-history"
            className={`${styles.iconBtn} ${showHistory ? styles.active : ''}`}
            onClick={() => setShowHistory(v => !v)}
            aria-label="Session history"
            title="History"
          >
            <HistoryIcon />
          </button>
          <button
            id="btn-open-settings"
            className={`${styles.iconBtn} ${showSettings ? styles.active : ''}`}
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
            title="Settings"
          >
            <GearIcon />
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className={styles.main}>
        {/* Timer card */}
        <section className={`${styles.timerCard} glass-card`} aria-label="Pomodoro timer">
          <ModeSelector mode={mode} onSwitch={switchMode} />

          <div className={styles.timerArea}>
            <CircularProgress progress={progress} mode={mode}>
              <TimerDisplay timeLeft={timeLeft} mode={mode} />
              <p className={styles.tagline}>{MODE_TAGLINES[mode]}</p>
            </CircularProgress>
          </div>

          <Controls
            isRunning={isRunning}
            hasStarted={hasStarted}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSkip={skip}
            mode={mode}
          />
        </section>

        {/* History panel (inline, collapsible) */}
        {showHistory && (
          <section className={`${styles.historyCard} glass-card`} aria-label="Session history">
            <h2 className={styles.historyTitle}>Session History</h2>
            <SessionHistory history={history} onClear={clearHistory} />
          </section>
        )}
      </main>

      {/* Settings modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Built with focus &amp; calm · Antigravity Pomodoro</span>
      </footer>
    </div>
  );
}
