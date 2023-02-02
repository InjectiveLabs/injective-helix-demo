import { vite, head, hooks } from './nuxt-config'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  ssr: false,
  debug: !isProduction,
  builder: isProduction ? 'webpack' : 'vite',
  app: { head },
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

  // @ts-ignore
  bugsnag: {
    config: {
      apiKey: process.env.VITE_BUGSNAG_KEY
    }
  },

  hooks,
  vite: isProduction ? undefined : vite,

  typescript: {
    typeCheck: true
  }
})
