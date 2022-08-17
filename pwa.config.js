const resolve = require('path').resolve
const { pwaMetaTags, manifestMetaTags } = require('./meta.config')

module.exports = {
  pwa: {
    icon: {
      source: resolve(__dirname, './client/static/favicon.png')
    },

    meta: {
      favicon: true,
      ...pwaMetaTags
    },

    manifest: {
      ...manifestMetaTags
    }
  }
}
