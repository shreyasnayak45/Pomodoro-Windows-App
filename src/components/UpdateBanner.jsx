import React, { useEffect, useState } from 'react';
import './UpdateBanner.css';

const UpdateBanner = () => {
  const [status, setStatus] = useState(null);
  const [version, setVersion] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.updater) {
      const unsubscribe = window.electronAPI.updater.onStatusChange((data) => {
        setStatus(data.status);
        if (data.version) setVersion(data.version);
        if (data.percent) setProgress(Math.round(data.percent));
      });
      return () => unsubscribe();
    }
  }, []);

  if (status !== 'downloaded' && status !== 'downloading') {
    return null; // Only show banner when actively downloading or completely downloaded
  }

  const handleRestart = () => {
    if (window.electronAPI && window.electronAPI.updater) {
      window.electronAPI.updater.quitAndInstall();
    }
  };

  return (
    <div className="update-banner">
      <div className="update-content">
        {status === 'downloading' ? (
          <>
            <span className="update-icon">⬇️</span>
            <span className="update-text">Downloading update: {progress}%</span>
          </>
        ) : (
          <>
            <span className="update-icon">🎉</span>
            <span className="update-text">Update {version} is ready to install!</span>
            <button className="update-button" onClick={handleRestart}>
              Restart to Update
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateBanner;
