const { nuxtMetaTags } = require('./meta.config')

const meta = [
  { charset: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' }
]

if (process.env.META_TAGS_ENABLED === 'true') {
  meta.push(...nuxtMetaTags)
}

if (process.env.APP_GOOGLE_SITE_VERIFICATION_KEY) {
  meta.push({
    name: 'google-site-verification',
    content: process.env.APP_GOOGLE_SITE_VERIFICATION_KEY
  })
}

const scripts = []
if (process.env.NODE_ENV === 'production' && process.env.APP_ELEVIO_ID) {
  scripts.push({
    src:
      'https://cdn.elev.io/sdk/bootloader/v4/elevio-bootloader.js?cid=' +
      process.env.APP_ELEVIO_ID,
    async: true,
    defer: true,
    body: true
  })
}

module.exports = {
  titleTemplate: process.env.APP_NAME,
  meta,
  htmlAttrs: {
    class: 'bg-gray-1000'
  },
  bodyAttrs: {
    class: 'overflow-fix'
  },
  script: scripts,
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon-v4.png' },
    { rel: 'shortcut-icon', type: 'image/png', href: '/favicon-v4.png' },
    { rel: 'apple-touch-icon', type: 'image/png', href: '/favicon-v4.png' }
  ]
}
