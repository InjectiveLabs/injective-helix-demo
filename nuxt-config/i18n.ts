import { NuxtI18nOptions } from '@nuxtjs/i18n'
import en from '../locales/en'

export default {
  i18n: {
    locales: ['en'],
    vueI18n: {
      locale: 'en',
      fallbackLocale: 'en',
      availableLocales: ['en'],
      messages: { en }
    }
  }
} as NuxtI18nOptions
