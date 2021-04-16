import { Locale, english } from '~/locales'

const initialState = {
  locale: english
}

export const state = () => ({
  locale: initialState.locale as Locale
})

export type AppStoreState = ReturnType<typeof state>

export const mutations = {
  setAppLocale(state: AppStoreState, locale: Locale) {
    state.locale = locale
  }
}
