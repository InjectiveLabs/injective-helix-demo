import { defineStore } from 'pinia'
import { DEFAULT_GAS_PRICE } from '@shared/utils/constant'
import { alchemyKey } from '@shared/wallet/wallet-strategy'
import { fetchGasPrice } from '@shared/services/ethGasPrice'
import { GeneralException } from '@injectivelabs/exceptions'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import {
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'
import { tendermintApi } from '@/app/Services'
import { streamProvider } from '@/app/providers/StreamProvider'
import { NETWORK, CHAIN_ID, ETHEREUM_CHAIN_ID } from '@/app/utils/constants'
import {
  Modal,
  NoticeBanner,
  TradingLayout,
  OrderbookLayout,
  DontShowAgain
} from '@/types'

export interface UserBasedState {
  hasAcceptedTerms: boolean
  modalsViewed: Modal[]
  bannersViewed: NoticeBanner[]
  dontShowAgain: DontShowAgain[]
  favoriteMarkets: string[]

  preferences: {
    isHideBalances: boolean
    authZManagement: boolean
    futuresLeverage: string
    thousandsSeparator: boolean
    tradingLayout: TradingLayout
    subaccountManagement: boolean
    orderbookLayout: OrderbookLayout
    skipTradeConfirmationModal: boolean
    showGridTradingSubaccounts: boolean
    skipExperimentalConfirmationModal: boolean
  }
}

type AppStoreState = {
  blockHeight: number

  // App Settings
  chainId: ChainId
  gasPrice: string
  ethereumChainId: EthereumChainId

  // Dev Mode
  devMode: boolean | undefined

  // User settings
  userState: UserBasedState
}

const initialStateFactory = (): AppStoreState => ({
  blockHeight: 0,

  // App Settings
  chainId: CHAIN_ID,
  ethereumChainId: ETHEREUM_CHAIN_ID,
  gasPrice: DEFAULT_GAS_PRICE.toString(),

  // Dev Mode
  devMode: undefined,

  // User settings
  userState: {
    hasAcceptedTerms: false,
    modalsViewed: [],
    bannersViewed: [],
    dontShowAgain: [],
    favoriteMarkets: [],

    preferences: {
      isHideBalances: false,
      authZManagement: false,
      futuresLeverage: '1',
      thousandsSeparator: true,
      subaccountManagement: false,
      skipTradeConfirmationModal: false,
      tradingLayout: TradingLayout.Left,
      skipExperimentalConfirmationModal: false,
      showGridTradingSubaccounts: true,
      orderbookLayout: OrderbookLayout.Default
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
    async fetchBlockHeight() {
      const appStore = useAppStore()
      const latestBlock = await tendermintApi.fetchLatestBlock()

      appStore.$patch({
        blockHeight: Number(latestBlock?.header?.height || 0)
      })
    },

    async fetchGasPrice() {
      const appStore = useAppStore()

      appStore.$patch({
        gasPrice: await fetchGasPrice(NETWORK, { alchemyKey })
      })
    },

    validateGeoIpBasedOnDerivativesAction() {
      const sharedGeoStore = useSharedGeoStore()

      if (isCountryRestrictedForPerpetualMarkets(sharedGeoStore.country)) {
        throw new GeneralException(
          new Error('This action is not allowed in your country')
        )
      }
    },

    validateGeoIpBasedOnSpotAction({
      baseDenom,
      quoteDenom
    }: {
      baseDenom: string
      quoteDenom: string
    }) {
      const sharedGeoStore = useSharedGeoStore()

      const isCountryRestrictedFromSpotMarket = [baseDenom, quoteDenom].some(
        (denom) =>
          isCountryRestrictedForSpotMarket({
            country: sharedGeoStore.country,
            denomOrSymbol: denom
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

    toggleHideBalances() {
      const appStore = useAppStore()

      appStore.setUserState({
        ...appStore.userState,
        preferences: {
          ...appStore.userState.preferences,
          isHideBalances: !appStore.userState.preferences.isHideBalances
        }
      })
    },

    setFuturesLeverage(leverageAmount: string) {
      const appStore = useAppStore()

      appStore.setUserState({
        ...appStore.userState,
        preferences: {
          ...appStore.userState.preferences,
          futuresLeverage: leverageAmount
        }
      })
    },

    setUserState(userState: Object) {
      const appStore = useAppStore()

      // we have to use patch for values that we are caching in localStorage, this ensure that the payload is passed to the persistState function

      appStore.$patch({ userState })
    },

    cancelAllStreams() {
      streamProvider.cancelAll()
    },

    reset() {
      const appStore = useAppStore()

      const initialState = initialStateFactory()

      const hasAcceptedTerms = appStore.userState.hasAcceptedTerms

      appStore.$patch({
        ...initialState
      })

      appStore.userState = { ...initialState.userState, hasAcceptedTerms }
    }
  }
})
