import { defineStore } from 'pinia'
import { fetchGasPrice, DEFAULT_GAS_PRICE } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import { SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import {
  NETWORK,
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  GEO_IP_RESTRICTIONS_ENABLED,
  VPN_PROXY_VALIDATION_PERIOD
} from '@/app/utils/constants'
import { Locale, english } from '@/locales'
import {
  Modal,
  AppState,
  GeoLocation,
  NoticeBanner,
  TradingLayout,
  OrderbookLayout,
  UiMarketWithToken
} from '@/types'
import {
  fetchGeoLocation,
  validateGeoLocation,
  fetchUserCountryFromBrowser,
  detectVPNOrProxyUsageNoThrow,
  displayVPNOrProxyUsageToast
} from '@/app/services/region'
import { todayInSeconds } from '@/app/utils/time'
import { streamProvider } from '@/app/providers/StreamProvider'
import { alchemyKey } from '@/app/wallet-strategy'
import { amplitudeWalletTracker } from '@/app/providers/amplitude'
import {
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'

export interface UserBasedState {
  favoriteMarkets: string[]
  bannersViewed: NoticeBanner[]
  modalsViewed: Modal[]

  geoLocation: GeoLocation
  preferences: {
    orderbookLayout: OrderbookLayout
    tradingLayout: TradingLayout
    authZManagement: boolean
    subaccountManagement: boolean
    skipTradeConfirmationModal: boolean
  }
}

type AppStoreState = {
  // App Settings
  locale: Locale
  chainId: ChainId
  gasPrice: string
  ethereumChainId: EthereumChainId

  // Loading States
  state: AppState

  // Dev Mode
  devMode: boolean | undefined

  // User settings
  userState: UserBasedState
}

const initialStateFactory = (): AppStoreState => ({
  // App Settings
  locale: english,
  chainId: CHAIN_ID,
  ethereumChainId: ETHEREUM_CHAIN_ID,
  gasPrice: DEFAULT_GAS_PRICE.toString(),

  // Loading States
  state: AppState.Idle,

  // Dev Mode
  devMode: undefined,

  // User settings
  userState: {
    modalsViewed: [],
    bannersViewed: [],
    favoriteMarkets: [],
    geoLocation: {
      continent: '',
      country: '',
      browserCountry: '',
      vpnCheckTimestamp: 0
    },
    preferences: {
      skipTradeConfirmationModal: false,
      orderbookLayout: OrderbookLayout.Default,
      tradingLayout: TradingLayout.Left,
      subaccountManagement: false,
      authZManagement: false
    }
  }
})

export const useAppStore = defineStore('app', {
  state: (): AppStoreState => initialStateFactory(),
  getters: {
    favoriteMarkets: (state: AppStoreState) => {
      return state.userState.favoriteMarkets
    },

    isSubaccountManagementActive: (state: AppStoreState) => {
      return state.userState?.preferences?.subaccountManagement
    },

    isAuthzManagementActive: (state: AppStoreState) => {
      return state.userState?.preferences?.authZManagement
    }
  },
  actions: {
    async init() {
      const appStore = useAppStore()

      await appStore.fetchGeoLocation()
    },

    async fetchGasPrice() {
      const appStore = useAppStore()

      appStore.$patch({
        gasPrice: await fetchGasPrice(NETWORK, { alchemyKey })
      })
    },

    async fetchGeoLocation() {
      const appStore = useAppStore()

      const geoLocation = await fetchGeoLocation()

      appStore.$patch({
        userState: {
          ...appStore.userState,
          geoLocation
        }
      })
    },

    queue() {
      const appStore = useAppStore()

      if (appStore.state === AppState.Busy) {
        throw new GeneralException(new Error('You have a pending transaction.'))
      } else {
        appStore.$patch({
          state: AppState.Busy
        })
      }
    },

    async validateGeoIp() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      if (!GEO_IP_RESTRICTIONS_ENABLED) {
        return
      }
      const geoLocation = appStore.userState.geoLocation

      const now = todayInSeconds()
      const shouldCheckVpnOrProxyUsage = SECONDS_IN_A_DAY.times(
        VPN_PROXY_VALIDATION_PERIOD
      )
        .plus(geoLocation.vpnCheckTimestamp)
        .lte(now)

      if (!shouldCheckVpnOrProxyUsage) {
        return
      }

      const vpnOrProxyUsageDetected = await detectVPNOrProxyUsageNoThrow()

      if (!vpnOrProxyUsageDetected) {
        appStore.setUserState({
          ...appStore.userState,
          geoLocation: {
            ...geoLocation,
            vpnCheckTimestamp: todayInSeconds()
          }
        })

        return
      }

      /*
       ** If vpn is detected, we get the geolocation from
       ** browser api to check if it's on the restricted list
       ** Else we use geoip to check if the user is
       ** in a country from the restricted list
       */

      await displayVPNOrProxyUsageToast()

      const userCountryFromBrowser = await fetchUserCountryFromBrowser()

      appStore.setUserState({
        ...appStore.userState,
        geoLocation: {
          ...geoLocation,
          browserCountry: userCountryFromBrowser
        }
      })

      const countryToPerformValidation =
        userCountryFromBrowser || appStore.userState.geoLocation.country

      validateGeoLocation(countryToPerformValidation)

      appStore.setUserState({
        ...appStore.userState,
        geoLocation: {
          ...geoLocation,
          vpnCheckTimestamp: todayInSeconds()
        }
      })

      amplitudeWalletTracker.submitWalletSelectedTrackEvent({
        wallet: walletStore.wallet,
        userCountryFromBrowser: appStore.userState.geoLocation.browserCountry,
        userCountryFromVpnApi: appStore.userState.geoLocation.country
      })
    },

    validateGeoIpBasedOnDerivativesAction() {
      const appStore = useAppStore()

      if (
        isCountryRestrictedForPerpetualMarkets(
          appStore.userState.geoLocation.browserCountry ||
            appStore.userState.geoLocation.country
        )
      ) {
        throw new GeneralException(
          new Error('This action is not allowed in your country')
        )
      }
    },

    validateGeoIpBasedOnSpotAction(market: UiMarketWithToken) {
      const appStore = useAppStore()

      const isCountryRestrictedFromSpotMarket = [
        market.baseToken,
        market.quoteToken
      ].some((token) =>
        isCountryRestrictedForSpotMarket({
          country:
            appStore.userState.geoLocation.browserCountry ||
            appStore.userState.geoLocation.country,
          denomOrSymbol: token.symbol.toLowerCase()
        })
      )

      if (isCountryRestrictedFromSpotMarket) {
        throw new GeneralException(
          new Error('This action is not allowed in your country')
        )
      }
    },

    toggleFavoriteMarket(marketId: string) {
      const appStore = useAppStore()

      const cachedFavoriteMarkets = appStore.userState.favoriteMarkets

      const favoriteMarkets = cachedFavoriteMarkets.includes(marketId)
        ? cachedFavoriteMarkets.filter((m) => m !== marketId)
        : [marketId, ...cachedFavoriteMarkets]

      appStore.$patch({
        userState: {
          ...appStore.userState,
          favoriteMarkets
        }
      })
    },

    setUserState(userState: Object) {
      const appStore = useAppStore()

      appStore.$patch({ userState })
    },

    async pollMarkets() {
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()

      await derivativeStore.fetchMarketsSummary()
      await spotStore.fetchMarketsSummary()
    },

    cancelAllStreams() {
      streamProvider.cancelAll()
    }
  }
})
