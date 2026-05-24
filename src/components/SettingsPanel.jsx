/* ============================================================
   SettingsPanel — Customizable durations for each mode
   ============================================================ */
import React, { useState } from 'react';
import styles from './SettingsPanel.module.css';

const MODES = [
  { key: 'focus', label: 'Focus', min: 1, max: 120 },
  { key: 'short', label: 'Short Break', min: 1, max: 60 },
  { key: 'long',  label: 'Long Break',  min: 1, max: 90 },
];

export default function SettingsPanel({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings });

  const handleChange = (key, val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setLocal(prev => ({ ...prev, [key]: num }));
    }
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${styles.panel} glass-card`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button
            id="btn-close-settings"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <p className={styles.subtitle}>Customize session durations (minutes)</p>

        <div className={styles.fields}>
          {MODES.map(m => (
            <div key={m.key} className={styles.field}>
              <label htmlFor={`setting-${m.key}`} className={`${styles.label} ${styles[m.key]}`}>
                {m.label}
              </label>
              <div className={styles.inputRow}>
                <input
                  id={`setting-${m.key}`}
                  type="number"
                  className={styles.input}
                  value={local[m.key]}
                  min={m.min}
                  max={m.max}
                  onChange={e => handleChange(m.key, e.target.value)}
                />
                <span className={styles.unit}>min</span>
              </div>
              <input
                type="range"
                className={`${styles.range} ${styles[`range-${m.key}`]}`}
                value={local[m.key]}
                min={m.min}
                max={m.max}
                onChange={e => handleChange(m.key, e.target.value)}
                aria-label={`${m.label} duration`}
              />
              <div className={styles.rangeLabels}>
                <span>{m.min}m</span>
                <span>{m.max}m</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button id="btn-settings-cancel" className={styles.cancel} onClick={onClose}>Cancel</button>
          <button id="btn-settings-save" className={styles.save} onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
