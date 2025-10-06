import { head, hooks } from './nuxt-config'

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

  css: ['@/assets/css/tailwind.css'],

  pinia: {
    autoImports: ['defineStore']
  },

  sourcemap: {
    client: true,
    server: false
  },

  modules: [
    '@funken-studio/sitemap-nuxt-3',
    '@nuxt/ui',
    '@nuxt/eslint',
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
        file: './i18n/locales/en.ts'
      },
      {
        code: 'zh',
        name: '中文',
        longName: '中文',
        file: './i18n/locales/cn.ts'
      },
      {
        code: 'kr',
        name: 'Kr',
        longName: '한국어',
        file: './i18n/locales/kr.ts'
      },
      {
        code: 'tr',
        name: 'Tr',
        longName: 'Türkçe',
        file: './i18n/locales/tr.ts'
      }
    ]
  },

  extends: [
    isLocalLayer
      ? './injective-ui'
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
  },

  vite: {
    resolve: {
      alias: [
        {
          find: '@shared/services/ethGasPrice',
          replacement: new URL(
            './injective-ui/Service/app/ethGasPrice/index.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/services',
          replacement: new URL(
            './injective-ui/Service/app',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/wallet/alchemy',
          replacement: new URL(
            './injective-ui/wallet/alchemy.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/Service',
          replacement: new URL(
            './injective-ui/Service/index.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/utils/constant',
          replacement: new URL(
            './injective-ui/utils/constant/index.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/types',
          replacement: new URL(
            './injective-ui/types/index.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/transformer/trade',
          replacement: new URL(
            './injective-ui/transformer/trade/index.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/utils/async',
          replacement: new URL(
            './injective-ui/utils/async.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared/utils/helper',
          replacement: new URL(
            './injective-ui/utils/helper.ts',
            import.meta.url
          ).pathname
        },
        {
          find: '@shared',
          replacement: new URL('./injective-ui', import.meta.url).pathname
        },
        {
          find: '@injective-ui',
          replacement: new URL('./injective-ui', import.meta.url).pathname
        }
      ]
    }
  }
})
