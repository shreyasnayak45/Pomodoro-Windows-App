/* ============================================================
   CircularProgress — SVG ring progress indicator
   ============================================================ */
import React from 'react';
import styles from './CircularProgress.module.css';

const SIZE = 280;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularProgress({ progress, children, mode }) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          className={styles.track}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          className={`${styles.arc} ${styles[mode]}`}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
