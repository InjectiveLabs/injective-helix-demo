import { defineStore } from 'pinia'
import {
  DEFAULT_GAS_PRICE,
  SECONDS_IN_A_DAY,
  fetchGasPrice
} from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import {
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  GEO_IP_RESTRICTIONS_ENABLED,
  NETWORK,
  VPN_PROXY_VALIDATION_PERIOD
} from '@/app/utils/constants'
import { Locale, english } from '@/locales'
import {
  AppState,
  GeoLocation,
  NoticeBanner,
  OrderbookLayout,
  TradingLayout
} from '@/types'
import {
  fetchGeoLocation,
  validateGeoLocation,
  detectVPNOrProxyUsageNoThrow
} from '@/app/services/region'
import { todayInSeconds } from '@/app/utils/time'
import { streamProvider } from '@/app/providers/StreamProvider'
import {
  fetchAnnouncementAttachment,
  fetchAnnouncementsList
} from '@/app/services/announcements'
import { UiAnnouncementTransformer } from '@/app/client/transformers/UiAnnouncementTransformer'
import { Announcement, Attachment } from '@/app/client/types/announcements'
import { alchemyKey } from '@/app/wallet-strategy'

export interface UserBasedState {
  vpnOrProxyUsageValidationTimestamp: number
  favoriteMarkets: string[]
  geoLocation: GeoLocation
  orderbookLayout: OrderbookLayout
  tradingLayout: TradingLayout
  ninjaPassWinnerModalViewed: boolean
  userFeedbackModalViewed: boolean
  skipTradeConfirmationModal: boolean
  bannersViewed: NoticeBanner[]
}

type AppStoreState = {
  // App Settings
  locale: Locale
  chainId: ChainId
  ethereumChainId: EthereumChainId
  gasPrice: string

  // Loading States
  state: AppState

  // User settings
  userState: UserBasedState
  announcements: Announcement[]
  attachments: Attachment[]
}

const initialStateFactory = (): AppStoreState => ({
  // App Settings
  locale: english,
  chainId: CHAIN_ID,
  ethereumChainId: ETHEREUM_CHAIN_ID,
  gasPrice: DEFAULT_GAS_PRICE.toString(),

  // Loading States
  state: AppState.Idle,

  // User settings
  userState: {
    vpnOrProxyUsageValidationTimestamp: 0,
    favoriteMarkets: [],
    geoLocation: {
      continent: '',
      country: ''
    },
    orderbookLayout: OrderbookLayout.Default,
    tradingLayout: TradingLayout.Left,
    ninjaPassWinnerModalViewed: false,
    userFeedbackModalViewed: false,
    skipTradeConfirmationModal: false,
    bannersViewed: []
  },
  announcements: [],
  attachments: []
})

export const useAppStore = defineStore('app', {
  state: (): AppStoreState => initialStateFactory(),
  getters: {
    favoriteMarkets: (state: AppStoreState) => {
      return state.userState.favoriteMarkets
    }
  },
  actions: {
    async init() {
      const appStore = useAppStore()

      await appStore.fetchGeoLocation()
      await appStore.detectVPNOrProxyUsage()
    },

    updateFavoriteMarkets(marketId: string) {
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

    async detectVPNOrProxyUsage() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      if (!appStore.userState.vpnOrProxyUsageValidationTimestamp) {
        return
      }

      const unixTimestamp =
        appStore.userState.vpnOrProxyUsageValidationTimestamp
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
        await walletStore.logout()
      } else {
        appStore.$patch({
          userState: {
            ...appStore.userState,
            vpnOrProxyUsageValidationTimestamp: now
          }
        })
      }
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

    async fetchGasPrice() {
      const appStore = useAppStore()

      appStore.$patch({
        gasPrice: await fetchGasPrice(NETWORK, { alchemyKey })
      })
    },

    async fetchGeoLocation() {
      const appStore = useAppStore()

      appStore.$patch({
        userState: {
          ...appStore.userState,
          geoLocation: await fetchGeoLocation()
        }
      })
    },

    async validate() {
      const appStore = useAppStore()

      if (GEO_IP_RESTRICTIONS_ENABLED) {
        if (appStore.userState.geoLocation) {
          await validateGeoLocation(appStore.userState.geoLocation)
        }

        await detectVPNOrProxyUsageNoThrow()

        appStore.$patch({
          userState: {
            ...appStore.userState,
            vpnOrProxyUsageValidationTimestamp: todayInSeconds()
          }
        })
      }
    },

    async pollMarkets() {
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()

      await derivativeStore.fetchMarketsSummary()
      await spotStore.fetchMarketsSummary()
    },

    async fetchAnnouncements() {
      const appStore = useAppStore()

      const announcements = await fetchAnnouncementsList()

      if (
        !announcements ||
        !announcements.articles ||
        announcements.articles.length === 0
      ) {
        return
      }

      const uiAnnouncements = announcements.articles.map(
        UiAnnouncementTransformer.convertAnnouncementToUiAnnouncement
      )

      appStore.$patch({
        announcements: uiAnnouncements
      })

      await appStore.fetchAttachments()
    },

    async fetchAttachments() {
      const appStore = useAppStore()

      if (appStore.announcements.length === 0) {
        return
      }

      const attachments = await Promise.all(
        appStore.announcements.map(
          ({ announcementId }: { announcementId: number }) =>
            fetchAnnouncementAttachment(announcementId)
        )
      )

      if (!attachments || attachments.length === 0) {
        return
      }

      const uiAttachments = attachments.map(
        UiAnnouncementTransformer.convertAttachmentToUiAttachment
      ) as Attachment[]

      appStore.$patch({
        attachments: uiAttachments
      })
    },

    cancelAllStreams() {
      streamProvider.cancelAll()
    }
  }
})
