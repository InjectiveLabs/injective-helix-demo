import { defineStore } from 'pinia'
import { alchemyKey } from '@shared/wallet/alchemy'
import { fetchGasPrice } from '@shared/services/ethGasPrice'
import { GeneralException } from '@injectivelabs/exceptions'
import {
  NETWORK,
  CHAIN_ID,
  DEFAULT_GAS_PRICE,
  ETHEREUM_CHAIN_ID
} from '@shared/utils/constant'
import { tendermintApi } from '@/app/Services'
import { streamProvider } from '@/app/providers/StreamProvider'
import {
  DEFAULT_SLIPPAGE,
  DEFAULT_100_CHART_CANDLE_BAR_SPACING
} from '@/app/utils/constants'
import {
  isCountryRestricted,
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'
import {
  NoticeBanner,
  TradingLayout,
  OrderbookLayout,
  TradingChartInterval
} from '@/types'
import type { Modal, HelixCtaToast } from '@/types'
import type { ChainId, EthereumChainId } from '@injectivelabs/ts-types'

export interface UserBasedState {
  modalsViewed: Modal[]
  hasAcceptedTerms: boolean
  favoriteMarkets: string[]
  bannersViewed: NoticeBanner[]
  marketSlippageIdMap: Record<string, string>
  dontShowAgain: Array<Modal | NoticeBanner | HelixCtaToast>

  preferences: {
    isHideBalances: boolean
    futuresLeverage: string
    authZManagement: boolean
    selectedLanguage: string
    thousandsSeparator: boolean
    chartZoomPreference: number
    tradingLayout: TradingLayout
    subaccountManagement: boolean
    orderbookLayout: OrderbookLayout
    skipTradeConfirmationModal: boolean
    showGridTradingSubaccounts: boolean
    skipExperimentalConfirmationModal: boolean
    tradingChartInterval: TradingChartInterval
  }
}

type AppStoreState = {
  // App Settings
  chainId: ChainId

  gasPrice: string
  blockHeight: number
  // User settings
  userState: UserBasedState

  // Dev Mode
  devMode: boolean | undefined

  ethereumChainId: EthereumChainId
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
    marketSlippageIdMap: {},

    preferences: {
      selectedLanguage: '',
      futuresLeverage: '1',
      isHideBalances: false,
      authZManagement: false,
      thousandsSeparator: true,
      subaccountManagement: false,
      showGridTradingSubaccounts: true,
      skipTradeConfirmationModal: false,
      tradingLayout: TradingLayout.Left,
      skipExperimentalConfirmationModal: false,
      orderbookLayout: OrderbookLayout.Default,
      tradingChartInterval: TradingChartInterval.D,
      chartZoomPreference: DEFAULT_100_CHART_CANDLE_BAR_SPACING
    }
  }
})

export const useAppStore = defineStore('app', {
  state: (): AppStoreState => initialStateFactory(),
  getters: {
    isCountryRestricted: (_) => {
      const sharedGeoStore = useSharedGeoStore()

      return isCountryRestricted(sharedGeoStore.country)
    },

    slippageByMarketId:
      (state: AppStoreState) =>
      (marketId: string): string => {
        return (
          state.userState?.marketSlippageIdMap?.[marketId] ||
          DEFAULT_SLIPPAGE.toFixed()
        )
      },

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

    setChartZoomPreference(number: number) {
      const appStore = useAppStore()

      appStore.setUserState({
        ...appStore.userState,
        preferences: {
          ...appStore.userState.preferences,
          chartZoomPreference: number
        }
      })
    },

    setSelectedLanguage(selectedLocale: string) {
      const appStore = useAppStore()

      appStore.setUserState({
        ...appStore.userState,
        preferences: {
          ...appStore.userState.preferences,
          selectedLanguage: selectedLocale
        }
      })
    },

    setUserState(userState: object) {
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

      const isIAssetBannerViewed = appStore.userState.bannersViewed.find(
        (item) => item === NoticeBanner.IAssets
      )

      appStore.$patch({
        ...initialState,
        userState: {
          ...initialState.userState,
          dontShowAgain: appStore.userState.dontShowAgain,
          bannersViewed: isIAssetBannerViewed ? [NoticeBanner.IAssets] : [],
          preferences: {
            ...appStore.userState.preferences,
            selectedLanguage: appStore.userState.preferences.selectedLanguage
          }
        }
      })

      appStore.userState.hasAcceptedTerms = hasAcceptedTerms
    }
  }
})
