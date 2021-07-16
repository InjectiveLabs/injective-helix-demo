const modules = require('./modules.config')
const routes = require('./routes.config')
const build = require('./build.config')
const { metaTags } = require('./app/utils/generators')

export default {
  ssr: false,
  target: 'server',

  /*
   ** Headers of the page
   */
  head: {
    titleTemplate:
      'Injective Exchange - DeFi DEX | Decentralized Derivatives Trading. Any Market. Anytime. Anywhere.',
    meta: [
      ...metaTags().appMetaTags(),
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'google-site-verification',
        content: '7uc-JRec4DcCVuc8b9paUMHp-_ZMJIbyjnkFAbBiELc'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png?v2' },
      { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png?v2' },
      { rel: 'apple-touch-icon', type: 'image/png', href: '/favicon.png?v2' }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#4ecdc4' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/global',
    '~/plugins/i18n',
    '~/plugins/utils',
    '~/plugins/store',

    { src: '~/plugins/slider', ssr: false },
    { src: '~/plugins/tooltip', ssr: false },
    { src: '~/plugins/clipboard', ssr: false },
    { src: '~/plugins/veevalidate', ssr: false }
  ],

  'google-gtag': {
    id: 'UA-165847042-1'
  },

  sitemap: {
    hostname: 'https://exchange.injective.network',
    gzip: true
  },

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/stylelint-module',
    'nuxt-typed-vuex'
  ],

  /*
   ** Nuxt.js modules
   */
  modules,

  tailwindcss: {
    jit: true,
    cssPath: './assets/css/app.scss',
    configPath: './tailwind.config.js'
  },

  env: {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    APP_VER: process.env.npm_package_version,
    APP_BASE_URL: process.env.APP_BASE_URL,
    METRICS_ENABLED: process.env.METRICS_ENABLED,
    GEO_IP_RESTRICTIONS_ENABLED: process.env.GEO_IP_RESTRICTIONS_ENABLED,
    TRANSFER_RESTRICTIONS_ENABLED: process.env.TRANSFER_RESTRICTIONS_ENABLED,
    MAINTENANCE_ENABLED: process.env.MAINTENANCE_ENABLED,
    APP_FEE_RECIPIENT: process.env.APP_FEE_RECIPIENT,
    APP_NETWORK: process.env.APP_NETWORK,
    APP_CHAIN_ID: process.env.APP_CHAIN_ID,
    APP_BUGSNAG_KEY: process.env.APP_BUGSNAG_KEY,
    APP_ALCHEMY_KEY: process.env.APP_ALCHEMY_KEY,
    APP_ALCHEMY_KOVAN_KEY: process.env.APP_ALCHEMY_KOVAN_KEY
  },

  router: {
    linkActiveClass: 'is-active',
    middleware: ['maintenance']
  },

  toast: {
    position: 'bottom-right',
    duration: 6000,
    theme: 'bubble'
  },

  generate: {
    routes
  },

  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},

  render: {
    static: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  },

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
  },

  /*
   ** Build configuration
   */
  build: {
    ...build,
    /*
     ** You can extend webpack config here
     */
    extend(config) {
      config.node = {
        fs: 'empty'
      }
    }
  }
}
