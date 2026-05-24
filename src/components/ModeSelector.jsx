/* ============================================================
   ModeSelector — Focus / Short Break / Long Break tabs
   ============================================================ */
import React from 'react';
import styles from './ModeSelector.module.css';

const MODES = [
  { key: 'focus', label: 'Focus' },
  { key: 'short', label: 'Short Break' },
  { key: 'long',  label: 'Long Break'  },
];

export default function ModeSelector({ mode, onSwitch }) {
  return (
    <nav className={styles.nav} aria-label="Timer mode">
      {MODES.map(m => (
        <button
          key={m.key}
          id={`mode-${m.key}`}
          className={`${styles.tab} ${mode === m.key ? styles.active : ''} ${styles[m.key]}`}
          onClick={() => onSwitch(m.key)}
          aria-pressed={mode === m.key}
        >
          {m.label}
        </button>
      ))}
    </nav>
  );
}
