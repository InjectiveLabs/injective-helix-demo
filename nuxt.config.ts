import { head, hooks } from './nuxt-config'
import { metaTags } from './nuxt-config/meta'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'
const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  hooks,
  ssr: false,
  builder: 'vite',
  app: {
    head
  },

  compatibilityDate: '2024-09-09',

  // css: ['@/assets/css/tailwind.css'],

  sourcemap: {
    client: true,
    server: false
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    ...(isProduction && import.meta.env.NUXT_CLARITY_ID
      ? ['nuxt-clarity-analytics']
      : [])
  ],

  imports: {
    dirs: ['composables/**', 'store/*.ts', 'store/**/index.ts']
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      {
        code: 'en',
        name: 'En',
        longName: 'English',
        file: './en.ts'
      },
      {
        code: 'zh',
        name: '中文',
        longName: '中文',
        file: './cn.ts'
      },
      {
        code: 'kr',
        name: 'Kr',
        longName: '한국어',
        file: './kr.ts'
      },
      {
        code: 'tr',
        name: 'Tr',
        longName: 'Türkçe',
        file: './tr.ts'
      }
    ]
  },

  extends: [
    isLocalLayer
      ? '../injective-ui'
      : 'github:InjectiveLabs/injective-ui#feat/tree-shaking'
  ],
  // @ts-ignore
  site: {
    url: 'https://helixapp.com',
    name: metaTags.description
  },

  postcss: {
    plugins: {
      autoprefixer: {},
      tailwindcss: {}
    }
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
