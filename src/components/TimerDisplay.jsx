/* ============================================================
   TimerDisplay — Shows MM:SS with animated digit transitions
   ============================================================ */
import React, { useMemo } from 'react';
import styles from './TimerDisplay.module.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return {
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export default function TimerDisplay({ timeLeft, mode }) {
  const { minutes, seconds } = useMemo(() => formatTime(timeLeft), [timeLeft]);

  return (
    <div className={styles.display} aria-label={`${minutes} minutes ${seconds} seconds remaining`}>
      <span className={`${styles.segment} ${styles[mode]}`}>{minutes}</span>
      <span className={styles.colon}>:</span>
      <span className={`${styles.segment} ${styles[mode]}`}>{seconds}</span>
    </div>
  );
}
