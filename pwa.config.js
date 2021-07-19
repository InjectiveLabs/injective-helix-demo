const { metaTags } = require('./app/utils/generators')

module.exports = {
  pwa: {
    icon: {
      source: 'static/favicon.png'
    },

    meta: {
      favicon: true,
      ...metaTags().pwaMetaTags()
    },

    manifest: {
      ...metaTags().manifestMetaTags()
    }
  }
}
