const { createWindow } = require('../window');
const { app } = require('electron');

const trayMenus = [
  { label: 'monitor', click: () => createWindow('home').show() },
  { label: 'history', click: () => createWindow('history') },
  { label: 'quit', click: () => {
    app.isQuiting = true;
    app.quit();
    }
  }
];

module.exports = trayMenus;
