import { actionTree } from 'typed-vuex'
import { ChainId } from '@injectivelabs/ts-types'
import { TESTNET_CHAIN_ID, TESTNET_GAS_PRICE } from '~/app/utils/constants'
import { fetchGasPrice } from '~/app/services/gas'
import { Locale, english } from '~/locales'

const initialState = {
  locale: english,
  chainId: TESTNET_CHAIN_ID,
  gasPrice: TESTNET_GAS_PRICE.toString()
}

export const state = () => ({
  locale: initialState.locale as Locale,
  chainId: initialState.chainId as ChainId,
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
    async init(_) {
      await this.app.$accessor.app.fetchGasPrice()
    },

    async fetchGasPrice({ commit }) {
      commit(
        'setGasPrice',
        (await fetchGasPrice()) || TESTNET_GAS_PRICE.toString()
      )
    },

    async poll(_) {
      await this.app.$accessor.derivatives.fetchMarketsSummary()
      await this.app.$accessor.spot.fetchMarketsSummary()
    }
  }
)
