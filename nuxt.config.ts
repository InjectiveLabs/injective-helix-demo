import { vite, head, hooks } from './nuxt-config'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

export default defineNuxtConfig({
  app: { head },
  ssr: false,
  debug: !isProduction,
  builder: isWebpack ? 'webpack' : 'vite',
  css: ['@/assets/css/tailwind.css'],

  modules: [
    '@injectivelabs/ui-notifications',
    '@injectivelabs/ui-shared',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ...(process.env.VITE_BUGSNAG_KEY ? ['nuxt-bugsnag'] : [])
  ],

  imports: {
    dirs: ['composables/**']
  },

  plugins: [...vitePlugins],

  bugsnag: process.env.VITE_BUGSNAG_KEY
    ? {
        disabled: !isWebpack || !isProduction,
        publishRelease: true,
        baseUrl: process.env.VITE_BASE_URL,
        config: {
          releaseStage: process.env.VITE_ENV,
          enabledReleaseStages: ['staging', 'mainnet'],
          appVersion: process.env.npm_package_version,
          apiKey: process.env.VITE_BUGSNAG_KEY
        }
      }
    : undefined,

  hooks,
  vite: isWebpack ? undefined : vite,

  sourcemap: { client: true },

  typescript: {
    typeCheck: true
  }
})
