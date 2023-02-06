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
    'nuxt-bugsnag'
  ],

  imports: {
    dirs: ['composables/**']
  },

  plugins: [...vitePlugins],

  bugsnag: {
    disabled: !isWebpack || !isProduction,
    publishRelease: true,
    baseUrl: process.env.VITE_BASE_URL,
    config: {
      releaseStage: process.env.VITE_ENV,
      enabledReleaseStages: ['staging', 'mainnet'],
      appVersion: process.env.npm_package_version,
      apiKey: process.env.VITE_BUGSNAG_KEY
    }
  },

  hooks,
  vite: isWebpack ? undefined : vite,

  typescript: {
    typeCheck: true
  }
})
