import { head, hooks } from './nuxt-config'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'

export default defineNuxtConfig({
  hooks,
  ssr: false,
  builder: 'vite',
  css: ['@/assets/css/tailwind.css'],
  extends: [
    isLocalLayer
      ? '../injective-ui/layer'
      : 'github:InjectiveLabs/injective-ui/layer#master'
  ],

  app: {
    head
  },

  imports: {
    dirs: ['composables/**', 'store/*.ts', 'store/**/index.ts']
  },

  pinia: {
    autoImports: ['defineStore']
  },

  modules: ['@funken-studio/sitemap-nuxt-3'],

  // @ts-ignore
  sitemap: {
    hostname:
      process.env.VITE_BASE_URL &&
      !process.env.VITE_BASE_URL.includes('localhost')
        ? process.env.VITE_BASE_URL
        : 'https://helixapp.com',
    gzip: true
  },

  // @ts-ignore
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
