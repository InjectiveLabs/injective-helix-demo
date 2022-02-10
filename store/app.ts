import { actionTree } from 'typed-vuex'
import { ChainId } from '@injectivelabs/ts-types'
import {
  CHAIN_ID,
  DEFAULT_GAS_PRICE,
  GEO_IP_RESTRICTIONS_ENABLED,
  SECONDS_IN_A_DAY,
  VPN_PROXY_VALIDATION_PERIOD
} from '~/app/utils/constants'
import { Locale, english } from '~/locales'
import { AppState, GeoLocation } from '~/types'
import {
  fetchGeoLocation,
  validateGeoLocation,
  detectVPNOrProxyUsage,
  detectVPNOrProxyUsageNoThrow
} from '~/app/services/region'
import { app } from '~/app/singletons/App'
import { todayInSeconds } from '~/app/utils/time'
import { gasService } from '~/app/services'

export interface UserBasedState {
  vpnOrProxyUsageValidationTimestamp: number
  auctionsViewed: number[]
  geoLocation: GeoLocation
}

const initialState = {
  // App Settings
  locale: english,
  state: AppState.Idle,
  chainId: CHAIN_ID,
  gasPrice: DEFAULT_GAS_PRICE.toString(),

  // User settings
  userState: {
    vpnOrProxyUsageValidationTimestamp: 0,
    auctionsViewed: [],
    geoLocation: {
      continent: '',
      country: ''
    }
  } as UserBasedState
}

export const state = () => ({
  locale: initialState.locale as Locale,
  chainId: initialState.chainId as ChainId,
  gasPrice: initialState.gasPrice as string,
  state: initialState.state as AppState,
  userState: initialState.userState as UserBasedState
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

  setUserState(state: AppStoreState, userState: UserBasedState) {
    state.userState = userState
  },

  setAuctionsViewed(state: AppStoreState, auctionRound: number) {
    state.userState = {
      ...state.userState,
      auctionsViewed: [...state.userState.auctionsViewed, auctionRound]
    }
  }
}

export const actions = actionTree(
  { state },
  {
    async init({ state }) {
      await this.app.$accessor.app.fetchGeoLocation()
      await this.app.$accessor.app.detectVPNOrProxyUsage()

      app.setGeoLocation(state.userState.geoLocation)
    },

    async detectVPNOrProxyUsage({ state, commit }) {
      if (!state.userState.vpnOrProxyUsageValidationTimestamp) {
        return
      }

      const unixTimestamp = state.userState.vpnOrProxyUsageValidationTimestamp
      const now = todayInSeconds()
      const shouldCheckVpnOrProxyUsage = SECONDS_IN_A_DAY.times(
        VPN_PROXY_VALIDATION_PERIOD
      )
        .plus(unixTimestamp)
        .lte(now)

      if (!shouldCheckVpnOrProxyUsage) {
        return
      }

      const vpnOrProxyUsageDetected = await detectVPNOrProxyUsageNoThrow()

      if (vpnOrProxyUsageDetected) {
        await this.app.$accessor.wallet.logout()
      } else {
        commit('setUserState', {
          ...state.userState,
          vpnOrProxyUsageValidationTimestamp: todayInSeconds()
        })
      }
    },

    queue({ state, commit }) {
      if (state.state === AppState.Busy) {
        throw new Error('You have a pending transaction.')
      } else {
        commit('setAppState', AppState.Busy)
      }
    },

    async fetchGasPrice({ commit }) {
      commit('setGasPrice', await gasService.fetchGasPrice())
    },

    async fetchGeoLocation({ state, commit }) {
      commit('setUserState', {
        ...state.userState,
        geoLocation: await fetchGeoLocation()
      })
    },

    async validate({ state, commit }) {
      if (GEO_IP_RESTRICTIONS_ENABLED) {
        if (state.userState.geoLocation) {
          await validateGeoLocation(state.userState.geoLocation)
        }

        await detectVPNOrProxyUsage()

        commit('setUserState', {
          ...state.userState,
          vpnOrProxyUsageValidationTimestamp: todayInSeconds()
        })
      }
    },

    async poll(_) {
      await this.app.$accessor.derivatives.fetchMarketsSummary()
      await this.app.$accessor.spot.fetchMarketsSummary()
    }
  }
)
