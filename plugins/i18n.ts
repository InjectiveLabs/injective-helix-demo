import { createI18n } from 'vue-i18n'
import { defineNuxtPlugin } from '#imports'
import en from '@/locales/en'
import zh from '@/locales/zh'
import { localStorage } from '@/app/Services'

const storageApp = localStorage.get('state') as any
const locale =
  storageApp && storageApp.app && storageApp.app.locale
    ? storageApp.app.locale.locale
    : 'en'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale,
  messages: { en, zh }
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(i18n)
})
