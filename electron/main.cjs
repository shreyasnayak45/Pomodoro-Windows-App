const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../build/icon.ico'),
    show: false, // Don't show the window until it's ready to prevent visual flashing
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0,0,0,0)',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  // Show window when ready to ensure smooth loading and prevent broken sizes
  win.once('ready-to-show', () => {
    win.removeMenu()
    win.show()
  })

  if (isDev) {
    // Load the Vite dev server URL in development mode
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Load the built HTML file in production mode
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle updater IPC
  ipcMain.handle('updater:check', () => {
    autoUpdater.checkForUpdates().catch(err => {
      win.webContents.send('updater:status', { status: 'error', error: err.message });
    });
  });

  ipcMain.handle('updater:download', () => {
    autoUpdater.downloadUpdate().catch(err => {
      win.webContents.send('updater:status', { status: 'error', error: err.message });
    });
  });

  ipcMain.handle('updater:quitAndInstall', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('updater:getVersion', () => {
    return app.getVersion();
  });

  // Wire autoUpdater events to renderer
  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('updater:status', { status: 'checking' });
  });
  
  autoUpdater.on('update-available', (info) => {
    win.webContents.send('updater:status', { status: 'available', version: info.version });
  });

  autoUpdater.on('update-not-available', (info) => {
    win.webContents.send('updater:status', { status: 'up-to-date', version: info.version });
  });

  autoUpdater.on('error', (err) => {
    win.webContents.send('updater:status', { status: 'error', error: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('updater:status', { status: 'downloading', percent: progressObj.percent });
  });

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updater:status', { status: 'downloaded', version: info.version });
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
