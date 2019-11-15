const path = require('path');
const { app, BrowserWindow } = require('electron');
const { appIcon } = require('../../config/app.config');
const { port } = require('../../config/dev.config');

const urls = require('./window-urls');

const { NODE_ENV } = process.env;

const windowList = {};



function getWindowUrl(key) {
  let url, hash = urls[key], config = {};
  if (typeof hash === 'object') {
    config = hash.config || {};
    hash = hash.url
  }
  if (NODE_ENV === 'development') {
    url = `http://localhost:${port}#${hash}`
  } else {
    url = `file://${path.join(__dirname, '../../dist/index.html')}#${hash}`
  }
  return { url, config }
}


function createWindow(key, options = {}) {
  let win = windowList[key];

  if (windowList[key]) {
    win.show();
    return win
  }

  const { url, config } = getWindowUrl(key);

  let from;
  if (options.from) {
    from = options.from;
    delete options.from
  }

  const defaultOptions = {
    icon: appIcon,
    width: 1200,
    height: 900,
    show: false,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true
    },
    // frame: false, // 无边框窗口
    // skipTaskbar: false, // 是否在任务栏中隐藏窗口
    // backgroundColor: '#fff',
    // transparent: true, // 窗口是否透明
    // titleBarStyle: 'default',
    vibrancy: 'appearance-based', // 毛玻璃效果
    ...config
  };

  win = new BrowserWindow(Object.assign(defaultOptions, options));
  if (from) win.from = from;
  windowList[key] = win;
  win.loadURL(url);
  win.once('ready-to-show', () => {
    win.show()
    // win.webContents.openDevTools()
  });

  win.on('close', e => {
    /*if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }

    return false;*/
    delete windowList[key]
  });

  return win
}


module.exports = {
  createWindow,
  getWindowUrl,
  windowList,
};
