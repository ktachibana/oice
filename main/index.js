'use strict';
const electron = require('electron');
const ipc = electron.ipcMain;
const app = electron.app;
const recognizeSkill = require('./recognizeSkill');

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
  const win = new electron.BrowserWindow({
		width: 600,
		height: 400,
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
