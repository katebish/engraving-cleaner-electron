const path = require('path');
const { app, BrowserWindow } = require('electron');

if (process.env.NODE_ENV === 'development') {
  // Auto-reload on file changes (DEV only)
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,      // fallback width
    height: 800,      // fallback height
    show: false,      // hide until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.maximize(); // use full available screen
    win.show();
  });

  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
