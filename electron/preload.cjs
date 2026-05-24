const { contextBridge, ipcRenderer } = require('electron')

// Expose minimal API to the renderer process if needed.
// Currently the app uses native Web APIs (localStorage) so we don't expose anything extra.
contextBridge.exposeInMainWorld('electronAPI', {
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),
    getVersion: () => ipcRenderer.invoke('updater:getVersion'),
    onStatusChange: (callback) => {
      const handler = (event, data) => callback(data);
      ipcRenderer.on('updater:status', handler);
      return () => ipcRenderer.removeListener('updater:status', handler);
    }
  }
})
