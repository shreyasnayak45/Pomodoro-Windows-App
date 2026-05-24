/* ============================================================
   SettingsPanel — Customizable durations for each mode
   ============================================================ */
import React, { useState, useEffect } from 'react';
import styles from './SettingsPanel.module.css';

const MODES = [
  { key: 'focus', label: 'Focus', min: 1, max: 120 },
  { key: 'short', label: 'Short Break', min: 1, max: 60 },
  { key: 'long',  label: 'Long Break',  min: 1, max: 90 },
];

export default function SettingsPanel({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings });
  const [appVersion, setAppVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.updater) {
      window.electronAPI.updater.getVersion().then(setAppVersion);
      const unsubscribe = window.electronAPI.updater.onStatusChange((data) => {
        setUpdateStatus(data.status);
        if (data.percent) setUpdateProgress(Math.round(data.percent));
      });
      return () => unsubscribe();
    }
  }, []);

  const handleCheckUpdate = () => {
    if (window.electronAPI && window.electronAPI.updater) {
      window.electronAPI.updater.check();
    }
  };

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

        <div className={styles.sectionDivider}></div>
        <h3 className={styles.sectionTitle}>App Updates</h3>
        <div className={styles.updateSection}>
          <div className={styles.updateInfo}>
            <span className={styles.versionText}>Version {appVersion || 'Unknown'}</span>
            <span className={styles.updateStatusText}>
              {updateStatus === 'checking' && 'Checking...'}
              {updateStatus === 'available' && 'Update found!'}
              {updateStatus === 'up-to-date' && 'You are up to date!'}
              {updateStatus === 'downloading' && `Downloading: ${updateProgress}%`}
              {updateStatus === 'downloaded' && 'Ready to install!'}
              {updateStatus === 'error' && 'Update error.'}
            </span>
          </div>
          <button 
            className={styles.updateButton} 
            onClick={handleCheckUpdate} 
            disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
          >
            Check for Updates
          </button>
        </div>

        <div className={styles.actions}>
          <button id="btn-settings-cancel" className={styles.cancel} onClick={onClose}>Cancel</button>
          <button id="btn-settings-save" className={styles.save} onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
