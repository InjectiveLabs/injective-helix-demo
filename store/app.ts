import { Locale, english } from '~/locales'

const initialState = {
  locale: english,
  gasPrice: '0' // TODO - get from ethstation on init
}

export const state = () => ({
  locale: initialState.locale as Locale,
  gasPrice: initialState.gasPrice as string
})

export type AppStoreState = ReturnType<typeof state>

export const mutations = {
  setAppLocale(state: AppStoreState, locale: Locale) {
    state.locale = locale
  },

  setGasPrice(state: AppStoreState, gasPrice: string) {
    state.gasPrice = gasPrice
  }
}
