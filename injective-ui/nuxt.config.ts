import { vite } from './nuxt-config'
import { createResolver } from '@nuxt/kit'
import bugsnag from './nuxt-config/bugsnag'
import { defineNuxtConfig } from 'nuxt/config'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  bugsnag,
  plugins: vitePlugins,
  devtools: { enabled: true },

  alias: { '@shared': resolve('./') },

  // typescript: {
  //   typeCheck: 'build'
  // },

  pinia: {
    storesDirs: ['./store/*.ts', './store/*/index.ts']
  },

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  sourcemap: {
    client: true,
    server: false
  },

  components: [{ prefix: 'Shared', path: resolve('./components') }],

  imports: {
    dirs: ['composables/**', 'store/**', 'store/**/index.ts']
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/devtools',
    'nuxt-vitalizer',
    '@nuxt/test-utils/module',
    '@injectivelabs/nuxt-bugsnag'
  ]
})
