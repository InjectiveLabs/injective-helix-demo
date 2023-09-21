import en from '@/locales/en'
import zh from '@/locales/zh'
import { localStorage } from '@/app/Services'

const storageApp = localStorage.get('state') as any
const locale =
  storageApp && storageApp.app && storageApp.app.locale
    ? storageApp.app.locale.locale
    : 'en'

export default {
  globalInjection: true,
  legacy: false,
  locale,
  fallbackLocale: 'en',
  availableLocales: ['en', 'zh'],
  messages: { en, zh }
}
