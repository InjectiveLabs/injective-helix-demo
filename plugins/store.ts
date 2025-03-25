import {
  StateTree,
  PiniaPluginContext,
  SubscriptionCallback,
  SubscriptionCallbackMutationPatchObject
} from 'pinia'
import { StatusType } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-base'
import { isThrownException, ThrownException } from '@injectivelabs/exceptions'
import { defineNuxtPlugin } from '#imports'
import { localStorage } from '@/app/Services'
import { OrderbookLayout, TradingLayout, TradingChartInterval } from '@/types'

const stateToPersist = {
  app: {
    userState: {
      modalsViewed: [],
      bannersViewed: [],
      dontShowAgain: [],
      favoriteMarkets: [],
      marketSlippageIdMap: {},

      preferences: {
        futuresLeverage: '1',
        isHideBalances: false,
        authZManagement: false,
        thousandsSeparator: false,
        subaccountManagement: false,
        skipTradeConfirmationModal: false,
        tradingLayout: TradingLayout.Left,
        skipExperimentalConfirmationModal: false,
        orderbookLayout: OrderbookLayout.Default,
        tradingChartInterval: TradingChartInterval.D
      }
    }
  },

  account: {
    subaccountId: ''
  },

  sharedGeo: {
    geoContinent: '',
    geoCountry: '',
    ipCountry: '',
    ipAddress: '',
    vpnCheckedTimestamp: 0
  },

  sharedWallet: {
    walletConnectStatus: '',
    hwAddresses: '',
    wallet: Wallet.Metamask,
    address: '',
    addresses: '',
    injectiveAddress: '',
    addressConfirmation: '',
    session: '',

    authZ: {
      address: '',
      direction: '',
      injectiveAddress: '',
      defaultSubaccountId: ''
    },
    autoSign: {
      privateKey: '',
      expiration: '',
      injectiveAddress: '',
      duration: ''
    },
    privateKey: ''
  }
} as Record<string, Record<string, any>>

const actionsThatSetAppStateToBusy = [
  'peggy/transfer',
  'peggy/withdraw',
  'account/deposit',
  'account/transfer',
  'account/withdraw',
  'spot/cancelOrder',
  'campaign/joinGuild',
  'campaign/createGuild',
  'campaign/claimReward',
  'spot/batchCancelOrder',
  'spot/submitLimitOrder',
  'account/withdrawToMain',
  'swap/submitAtomicOrder',
  'derivative/cancelOrder',
  'position/closePosition',
  'spot/submitMarketOrder',
  'peggy/setTokenAllowance',
  'account/externalTransfer',
  'authZ/grantAuthorization',
  'authZ/revokeAuthorization',
  'position/closeAllPosition',
  'derivative/submitTpSlOrder',
  'derivative/batchCancelOrder',
  'derivative/submitLimitOrder',
  'gridStrategy/createStrategy',
  'gridStrategy/removeStrategy',
  'gridStrategy/createPerpStrategy',
  'gridStrategy/createSpotLiquidityBot',
  'gridStrategy/createSpotGridStrategy',
  'gridStrategy/removeStrategyForSubaccount',
  'derivative/submitMarketOrder',
  'position/addMarginToPosition',
  'activity/batchCancelSpotOrders',
  'derivative/submitStopLimitOrder',
  'derivative/submitStopMarketOrder',
  'account/convertNeptuneToPeggyUsdt',
  'account/convertPeggyToNeptuneUsdt',
  'swap/submitAtomicOrderExactOutput',
  'activity/batchCancelDerivativeOrders',
  'position/closePositionAndReduceOnlyOrders'
]

const actionsThatThrowErrors = ['token/fetchTokensUsdPriceMap']

const persistState = (
  mutation: SubscriptionCallbackMutationPatchObject<StateTree>,
  state: StateTree
) => {
  if (!stateToPersist[mutation.storeId]) {
    return
  }

  const keysToPersist = Object.keys(stateToPersist[mutation.storeId])

  if (!mutation.payload) {
    return
  }

  const shouldPersistState =
    keysToPersist.length > 0 &&
    Object.keys(mutation?.payload || []).some((key) => {
      return keysToPersist.includes(key)
    })

  if (!shouldPersistState) {
    return
  }

  const source = mutation.payload

  const updatedState = keysToPersist.reduce((stateObj, key) => {
    return {
      ...stateObj,
      [key]: source[key] || state[key]
    }
  }, {})

  const existingState = (localStorage.get('state') || {}) as any
  localStorage.set('state', {
    ...stateToPersist,
    ...existingState,
    [mutation.storeId]: {
      ...updatedState
    }
  })
}

function piniaStoreSubscriber({ store }: PiniaPluginContext) {
  const localState = localStorage.get('state') as any
  const sharedWalletStore = useSharedWalletStore()
  const { $onError } = useNuxtApp()

  if (localState[store.$id]) {
    store.$state = { ...store.$state, ...localState[store.$id] }
  }

  store.$subscribe(persistState as SubscriptionCallback<StateTree>)

  store.$onAction(({ name, store: { $id }, after, onError }) => {
    after(() => {
      const type = `${$id}/${name}`
      if (actionsThatSetAppStateToBusy.includes(type)) {
        sharedWalletStore.$patch({
          queueStatus: StatusType.Idle
        })
      }
    })

    onError((error) => {
      const type = `${$id}/${name}`

      if (actionsThatSetAppStateToBusy.includes(type)) {
        sharedWalletStore.$patch({
          queueStatus: StatusType.Idle
        })
      }

      if (
        actionsThatThrowErrors.includes(type) &&
        isThrownException(error as Error)
      ) {
        $onError(error as unknown as ThrownException)
      }
    })
  }, true)
}

export default defineNuxtPlugin(
  ({
    vueApp: {
      config: { globalProperties }
    }
  }) => {
    globalProperties.$pinia.use(piniaStoreSubscriber)
  }
)
