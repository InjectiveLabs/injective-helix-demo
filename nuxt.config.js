const modules = require('./modules.config')
const routes = require('./routes.config')
const build = require('./build.config')
const head = require('./head.config')
const pwa = require('./pwa.config')

export default {
  ssr: false,
  target: 'static',

  /*
   ** Headers of the page
   */
  head,
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#00F2FE' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/icons',
    '~/plugins/elements',
    '~/plugins/i18n',
    '~/plugins/utils',
    '~/plugins/store',

    { src: '~/plugins/touch-events', ssr: false },
    { src: '~/plugins/tooltip', ssr: false },
    { src: '~/plugins/clipboard', ssr: false },
    { src: '~/plugins/veevalidate', ssr: false }
  ],

  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    }
  },

  'google-gtag': {
    id: process.env.APP_GOOGLE_ANALYTICS_KEY
  },

  sitemap: {
    hostname: process.env.APP_BASE_URL,
    gzip: true
  },

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/eslint-module',
    '@nuxtjs/dotenv',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/stylelint-module',
    'nuxt-typed-vuex'
  ],

  /*
   ** Nuxt.js modules
   */
  modules,

  /**
   * PWA
   **/
  pwa,

  tailwindcss: {
    cssPath: './assets/css/app.scss',
    configPath: './tailwind.config.js'
  },

  env: {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    APP_VER: process.env.npm_package_version,
    APP_BASE_URL: process.env.APP_BASE_URL,
    APP_EXCHANGE_API_ENDPOINT: process.env.APP_EXCHANGE_API_ENDPOINT,
    APP_SENTRY_GRPC_ENDPOINT: process.env.APP_SENTRY_GRPC_ENDPOINT,
    APP_SENTRY_HTTP_ENDPOINT: process.env.APP_SENTRY_HTTP_ENDPOINT,
    APP_GAS_REBATE_API: process.env.APP_GAS_REBATE_API,
    METRICS_ENABLED: process.env.METRICS_ENABLED,
    PRICE_BAND_ENABLED: process.env.PRICE_BAND_ENABLED,
    GAS_FREE_DEPOSIT_REBATE_ENABLED:
      process.env.GAS_FREE_DEPOSIT_REBATE_ENABLED,
    META_TAGS_ENABLED: process.env.META_TAGS_ENABLED,
    ORDERBOOK_POLLING_ENABLED: process.env.ORDERBOOK_POLLING_ENABLED,
    GEO_IP_RESTRICTIONS_ENABLED: process.env.GEO_IP_RESTRICTIONS_ENABLED,
    SHOW_AUCTION_COUNTDOWN: process.env.SHOW_AUCTION_COUNTDOWN,
    MAINTENANCE_ENABLED: process.env.MAINTENANCE_ENABLED,
    REFERRALS_ENABLED: process.env.REFERRALS_ENABLED,
    APP_FEE_RECIPIENT: process.env.APP_FEE_RECIPIENT,
    APP_ELEVIO_ID: process.env.APP_ELEVIO_ID,
    APP_NETWORK: process.env.APP_NETWORK,
    APP_CHAIN_ID: process.env.APP_CHAIN_ID,
    APP_GOOGLE_ANALYTICS_KEY: process.env.APP_GOOGLE_ANALYTICS_KEY,
    APP_GOOGLE_SITE_VERIFICATION_KEY:
      process.env.APP_GOOGLE_SITE_VERIFICATION_KEY,
    APP_BUGSNAG_KEY: process.env.APP_BUGSNAG_KEY,
    APP_ALCHEMY_KEY: process.env.APP_ALCHEMY_KEY,
    APP_ALCHEMY_KOVAN_KEY: process.env.APP_ALCHEMY_KOVAN_KEY,
    APP_COINGECKO_API_KEY: process.env.APP_COINGECKO_API_KEY,
    APP_PROXY_DETECTION_API_KEY: process.env.APP_PROXY_DETECTION_API_KEY
  },

  router: {
    linkActiveClass: 'is-active',
    middleware: ['maintenance', 'connected'],
    extendRoutes(routes) {
      return [
        ...routes,
        {
          name: 'register',
          path: '/register',
          component: './pages/portfolio.vue'
        }
      ]
    }
  },

  toast: {
    position: 'bottom-right',
    duration: 6000,
    theme: 'bubble'
  },

  generate: {
    routes
  },

  vendor: [
    {
      src: '@injectivelabs/token-metadata/dist/images',
      dst: './static/vendor/@injectivelabs/token-metadata'
    }
  ],

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
