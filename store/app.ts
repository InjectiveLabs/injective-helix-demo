import { actionTree } from 'typed-vuex'
import { ChainId } from '@injectivelabs/ts-types'
import {
  CHAIN_ID,
  DEFAULT_GAS_PRICE,
  GEO_IP_RESTRICTIONS_ENABLED
} from '~/app/utils/constants'
import { fetchGasPrice } from '~/app/services/gas'
import { Locale, english } from '~/locales'
import { AppState, GeoLocation } from '~/types'
import { fetchGeoLocation, validateGeoLocation } from '~/app/services/region'
import { app } from '~/app/singletons/App'

const initialState = {
  locale: english,
  state: AppState.Idle,
  chainId: CHAIN_ID,
  gasPrice: DEFAULT_GAS_PRICE.toString(),
  geoLocation: {
    continent: '',
    country: ''
  }
}

export const state = () => ({
  locale: initialState.locale as Locale,
  chainId: initialState.chainId as ChainId,
  gasPrice: initialState.gasPrice as string,
  state: initialState.state as AppState,
  geoLocation: initialState.geoLocation as GeoLocation
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
  },

  setGeoLocation(state: AppStoreState, geoLocation: GeoLocation) {
    state.geoLocation = geoLocation
  }
}

export const actions = actionTree(
  { state },
  {
    async init({ state }) {
      await this.app.$accessor.app.fetchGasPrice()
      await this.app.$accessor.app.fetchGeoLocation()

      app.setGeoLocation(state.geoLocation)
    },

    queue({ state, commit }) {
      if (state.state === AppState.Busy) {
        throw new Error('You have a pending transaction.')
      } else {
        commit('setAppState', AppState.Busy)
      }
    },

    async fetchGasPrice({ commit }) {
      commit('setGasPrice', await fetchGasPrice())
    },

    async fetchGeoLocation({ commit }) {
      commit('setGeoLocation', await fetchGeoLocation())
    },

    async validate({ state }) {
      if (state.geoLocation && GEO_IP_RESTRICTIONS_ENABLED) {
        await validateGeoLocation(state.geoLocation)
      }
    },

    async poll(_) {
      await this.app.$accessor.derivatives.fetchMarketsSummary()
      await this.app.$accessor.spot.fetchMarketsSummary()
    }
  }
)
