const { app, BrowserWindow } = require('electron')
const path = require('path')

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
