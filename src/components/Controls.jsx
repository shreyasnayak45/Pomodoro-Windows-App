/* ============================================================
   Controls — Start/Pause/Resume/Reset/Skip buttons
   ============================================================ */
import React from 'react';
import styles from './Controls.module.css';

// Icon components (inline SVG, no dependency)
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z"/>
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
    </svg>
  );
}
function SkipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
    </svg>
  );
}

export default function Controls({ isRunning, hasStarted, onStart, onPause, onResume, onReset, onSkip, mode }) {
  return (
    <div className={styles.controls}>
      {/* Secondary: Reset */}
      <button
        id="btn-reset"
        className={styles.secondary}
        onClick={onReset}
        aria-label="Reset timer"
        title="Reset"
      >
        <ResetIcon />
      </button>

      {/* Primary: Start / Pause / Resume */}
      {!hasStarted && !isRunning ? (
        <button
          id="btn-start"
          className={`${styles.primary} ${styles[mode]}`}
          onClick={onStart}
          aria-label="Start timer"
        >
          <PlayIcon />
          <span>Start</span>
        </button>
      ) : isRunning ? (
        <button
          id="btn-pause"
          className={`${styles.primary} ${styles[mode]}`}
          onClick={onPause}
          aria-label="Pause timer"
        >
          <PauseIcon />
          <span>Pause</span>
        </button>
      ) : (
        <button
          id="btn-resume"
          className={`${styles.primary} ${styles[mode]}`}
          onClick={onResume}
          aria-label="Resume timer"
        >
          <PlayIcon />
          <span>Resume</span>
        </button>
      )}

      {/* Secondary: Skip */}
      <button
        id="btn-skip"
        className={styles.secondary}
        onClick={onSkip}
        aria-label="Skip session"
        title="Skip"
      >
        <SkipIcon />
      </button>
    </div>
  );
}
