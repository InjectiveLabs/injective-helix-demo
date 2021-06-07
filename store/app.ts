import { actionTree } from 'typed-vuex'
import { ZERO_TO_STRING } from '~/app/utils/constants'
import { Locale, english } from '~/locales'

const initialState = {
  locale: english,
  gasPrice: ZERO_TO_STRING // TODO - get from ethstation on init
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

export const actions = actionTree(
  { state },
  {
    async poll(_) {
      await this.app.$accessor.derivatives.fetchMarketsSummary()
      await this.app.$accessor.spot.fetchMarketsSummary()
    }
  }
)
