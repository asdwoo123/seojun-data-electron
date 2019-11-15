const fixedConfig = { resizable: false, maximizable: false, minimizable: false }

const urls = {
  home: { url: '/', config: { title: 'home' } },

  demo1: { url: '/history/1', config: { title: 'history-1', minWidth: 600, minHeight: 400 } },
  demo2: { url: '/history/2', config: { title: 'history-2', minWidth: 600, minHeight: 400 } },

  about: {
    url: '/monitor',
    config: {
      title: ' 关于',
      width: 300, height: 240,
      ...fixedConfig,
    }
  },

};

module.exports = urls;
