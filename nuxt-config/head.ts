import { metaTags, nuxtMetaTags } from './meta'

const meta = [
  { charset: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ...nuxtMetaTags
]

if (process.env.VITE_GOOGLE_SITE_VERIFICATION_KEY) {
  meta.push({
    name: 'google-site-verification',
    content: '' // process.env.VITE_GOOGLE_SITE_VERIFICATION_KEY
  })
}

export default {
  title: metaTags.title,
  htmlAttrs: {
    lang: 'en'
  },
  bodyAttrs: {
    class: 'font-sans'
  },
  meta,
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'apple-touch-icon', type: 'image/png', href: '/favicon.png' },
    {
      as: 'font',
      rel: 'preload',
      type: 'font/woff2',
      href: '/Inter-Regular.woff2',
      crossorigin: 'anonymous'
    } as Record<string, string>
  ],
  script: [
    {
      src: '/chart/charting_library/charting_library.js',
      body: 'true'
    },
    { innerHTML: 'var exports = {}' }
  ] as any
}
