import { head, hooks } from './nuxt-config'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'

export default defineNuxtConfig({
  hooks,
  ssr: false,
  builder: 'vite',
  app: {
    head
  },

  compatibilityDate: '2024-09-09',

  css: ['@/assets/css/tailwind.css'],

  pinia: {
    autoImports: ['defineStore']
  },

  sourcemap: {
    client: true,
    server: false
  },

  modules: ['@funken-studio/sitemap-nuxt-3', '@nuxt/ui', '@nuxt/eslint'],

  imports: {
    dirs: ['composables/**', 'store/*.ts', 'store/**/index.ts']
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [{ code: 'en', file: './i18n/locales/en.ts' }]
  },

  extends: [
    isLocalLayer
      ? '../injective-ui/layer'
      : 'github:InjectiveLabs/injective-ui/layer#master'
  ],

  // @ts-expect-error - typing issue
  sitemap: {
    gzip: true,
    hostname:
      process.env.VITE_BASE_URL &&
      !process.env.VITE_BASE_URL.includes('localhost')
        ? process.env.VITE_BASE_URL
        : 'https://helixapp.com'
  },

  colorMode: {
    fallback: 'dark',
    preference: 'dark',
    storage: 'localStorage',
    componentName: 'ColorScheme',
    hid: 'nuxt-color-mode-script',
    storageKey: 'nuxt-color-mode',
    globalName: '__NUXT_COLOR_MODE__'
  }
})
