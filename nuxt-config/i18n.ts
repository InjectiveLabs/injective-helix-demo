import { NuxtI18nOptions } from '@nuxtjs/i18n'
import en from '../locales/en'

export default {
  i18n: {
    localeDir: 'locales',
    vueI18n: {
      runtimeOnly: false,
      globalInjection: true,
      locale: 'en',
      fallbackLocale: 'en',
      availableLocales: ['en'],
      messages: { en }
    }
  } as NuxtI18nOptions
}
