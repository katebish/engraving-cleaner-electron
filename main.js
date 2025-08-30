const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');

// Auto-reload on file changes (DEV only)
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   awaitWriteFinish: true
// });

let plateSizesArray = [];

function loadPlateSizes() {
  const filePath = path.join(__dirname, 'plate_sizes.csv');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    plateSizesArray = data
      .trim()
      .split(/\r?\n/)
      .map(line => line.split(','));
  } catch (err) {
    console.error('Error reading plate_sizes.csv:', err);

    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('file-read-error', err.message);
    });
  }
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

  // Show dev tools (DEV only)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  loadPlateSizes();
  createWindow();

});

// IPC handler so renderer.js can request the array
ipcMain.handle('get-plate-sizes', async () => {
  return plateSizesArray;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
