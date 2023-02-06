import { vite, head, hooks } from './nuxt-config'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

export default defineNuxtConfig({
  ssr: false,
  hooks,
  debug: !isProduction,
  vite: isWebpack ? undefined : vite,
  builder: isWebpack ? 'webpack' : 'vite',
  css: ['@/assets/css/tailwind.css'],

  app: {
    head
  },

  sourcemap: {
    client: true
  },

  imports: {
    dirs: ['composables/**']
  },

  typescript: {
    typeCheck: true
  },

  plugins: [...vitePlugins],

  modules: [
    '@injectivelabs/ui-notifications',
    '@injectivelabs/ui-shared',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ...(process.env.VITE_BUGSNAG_KEY ? ['nuxt-bugsnag'] : [])
  ],

  webpack: {
    terser: {
      terserOptions: {
        keep_classnames: false
      }
    }
  },

  bugsnag: process.env.VITE_BUGSNAG_KEY
    ? {
        disabled: false,
        publishRelease: true,
        baseUrl: process.env.VITE_BASE_URL,
        config: {
          releaseStage: process.env.VITE_ENV,
          notifyReleaseStages: ['staging', 'mainnet'],
          appVersion: process.env.npm_package_version,
          apiKey: process.env.VITE_BUGSNAG_KEY
        }
      }
    : undefined
})
