/* ============================================================
   SessionHistory — List of past sessions with status badges
   ============================================================ */
import React from 'react';
import styles from './SessionHistory.module.css';

const MODE_COLORS = {
  focus: 'focus',
  short: 'short',
  long:  'long',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>⏱</div>
      <p className={styles.emptyTitle}>No sessions yet</p>
      <p className={styles.emptyText}>Complete or skip a session to see your history here.</p>
    </div>
  );
}

export default function SessionHistory({ history, onClear }) {
  if (history.length === 0) return <EmptyState />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.historyHeader}>
        <span className={styles.count}>{history.length} session{history.length !== 1 ? 's' : ''}</span>
        <button
          id="btn-clear-history"
          className={styles.clearBtn}
          onClick={onClear}
          aria-label="Clear history"
        >
          Clear all
        </button>
      </div>

      <ul className={styles.list} role="list">
        {history.map((entry, idx) => (
          <li key={entry.id} className={`${styles.item} ${idx === 0 ? styles.newest : ''}`}>
            <div className={`${styles.modeDot} ${styles[MODE_COLORS[entry.mode]]}`} />
            <div className={styles.info}>
              <span className={`${styles.modeLabel} ${styles[MODE_COLORS[entry.mode]]}`}>
                {entry.modeLabel}
              </span>
              <span className={styles.duration}>
                {formatDuration(entry.completedSeconds)} / {entry.totalDuration}m
              </span>
            </div>
            <div className={styles.meta}>
              <span className={styles.datetime}>
                {formatDate(entry.date)} · {formatTime(entry.date)}
              </span>
              <span className={`${styles.badge} ${styles[entry.status]}`}>
                {entry.status === 'completed' ? '✓ Done' : '⤳ Skipped'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
