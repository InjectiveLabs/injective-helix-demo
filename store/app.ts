import { actionTree } from 'typed-vuex'
import { ChainId } from '@injectivelabs/ts-types'
import { TESTNET_CHAIN_ID, TESTNET_GAS_PRICE } from '~/app/utils/constants'
import { fetchGasPrice } from '~/app/services/gas'
import { Locale, english } from '~/locales'
import { AppState } from '~/types'

const initialState = {
  locale: english,
  state: AppState.Idle,
  chainId: TESTNET_CHAIN_ID,
  gasPrice: TESTNET_GAS_PRICE.toString()
}

export const state = () => ({
  locale: initialState.locale as Locale,
  chainId: initialState.chainId as ChainId,
  gasPrice: initialState.gasPrice as string,
  state: initialState.state as AppState
})

export type AppStoreState = ReturnType<typeof state>

export const mutations = {
  setAppState(state: AppStoreState, appState: AppState) {
    state.state = appState
  },

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

    queue({ state, commit }) {
      if (state.state === AppState.Busy) {
        throw new Error('Please finish your previous transaction first')
      } else {
        commit('setAppState', AppState.Busy)
      }
    },

    async fetchGasPrice({ commit }) {
      commit('setGasPrice', await fetchGasPrice())
    },

    async poll(_) {
      await this.app.$accessor.derivatives.fetchMarketsSummary()
      await this.app.$accessor.spot.fetchMarketsSummary()
    }
  }
)
