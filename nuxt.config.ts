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
      : 'github:InjectiveLabs/injective-ui/layer#feat/add-json-cloudfront-files-pull'
  ],

  app: {
    head
  },

  sourcemap: {
    server: false,
    client: true
  },

  imports: {
    dirs: ['composables/**', 'store/*.ts', 'store/**/index.ts']
  },

  modules: ['@funken-studio/sitemap-nuxt-3', '@nuxt/ui'],

  pinia: {
    autoImports: ['defineStore']
  },

  // @ts-ignore
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [{ code: 'en', file: './i18n/locales/en.ts' }]
  },

  // @ts-ignore
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    storage: 'localStorage',
    storageKey: 'nuxt-color-mode'
  },

  // @ts-ignore
  sitemap: {
    hostname:
      process.env.VITE_BASE_URL &&
      !process.env.VITE_BASE_URL.includes('localhost')
        ? process.env.VITE_BASE_URL
        : 'https://helixapp.com',
    gzip: true
  },

  compatibilityDate: '2024-09-09'
})
