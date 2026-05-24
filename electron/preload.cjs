const { contextBridge } = require('electron')

// Expose minimal API to the renderer process if needed.
// Currently the app uses native Web APIs (localStorage) so we don't expose anything extra.
contextBridge.exposeInMainWorld('electronAPI', {
  // Add IPC methods here if needed in the future
})
