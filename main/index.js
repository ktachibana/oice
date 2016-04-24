import { app, BrowserWindow, ipcMain as ipc } from 'electron';
import recognizeSkill from './recognizeSkill';

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + '/preload.js'
    }
  });

  win.loadURL(`file://${__dirname}/../ui/index.html`);
  win.on('closed', onClosed);

  return win;
}

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
});

ipc.on('recognize', (event, buffer) => {
  recognizeSkill(buffer).then((charm) => {
    event.returnValue = charm;
  });
});
