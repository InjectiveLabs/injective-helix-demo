import {
  PiniaPluginContext,
  StateTree,
  SubscriptionCallback,
  SubscriptionCallbackMutationPatchObject
} from 'pinia'
import { Wallet } from '@injectivelabs/wallet-ts'
import { defineNuxtPlugin } from '#imports'
import { localStorage } from '@/app/Services'
import { AppState, OrderbookLayout, TradingLayout } from '@/types'

const stateToPersist = {
  app: {
    userState: {
      favoriteMarkets: [],
      bannersViewed: [],
      modalsViewed: [],
      geoLocation: {
        continent: '',
        country: '',
        browserLocation: '',
        vpnCheckTimestamp: 0
      },
      preferences: {
        skipTradeConfirmationModal: false,
        skipExperimentalCOnfirmationModal: false,
        orderbookLayout: OrderbookLayout.Default,
        tradingLayout: TradingLayout.Left,
        subaccountManagement: false,
        authZManagement: false
      }
    }
  },

  account: {
    subaccountId: ''
  },

  wallet: {
    wallet: Wallet.Metamask,
    address: '',
    addresses: '',
    injectiveAddress: '',
    defaultSubaccountId: '',
    addressConfirmation: '',

    authZ: {
      address: '',
      direction: '',
      injectiveAddress: '',
      defaultSubaccountId: ''
    }
  }
} as Record<string, Record<string, any>>

const actionsThatSetAppStateToBusy = [
  'peggy/transfer',
  'peggy/withdraw',
  'account/deposit',
  'account/transfer',
  'account/withdraw',
  'account/withdrawToMain',
  'spot/cancelOrder',
  'campaign/joinGuild',
  'campaign/createGuild',
  'campaign/claimReward',
  'swap/submitAtomicOrder',
  'spot/batchCancelOrder',
  'spot/submitLimitOrder',
  'derivative/cancelOrder',
  'position/closePosition',
  'spot/submitMarketOrder',
  'peggy/setTokenAllowance',
  'account/externalTransfer',
  'position/closeAllPosition',
  'spot/submitStopLimitOrder',
  'spot/submitStopMarketOrder',
  'derivative/batchCancelOrder',
  'derivative/submitLimitOrder',
  'gridStrategy/createStrategy',
  'gridStrategy/removeStrategy',
  'derivative/submitMarketOrder',
  'position/addMarginToPosition',
  'activity/batchCancelSpotOrders',
  'derivative/submitStopLimitOrder',
  'derivative/submitStopMarketOrder',
  'swap/submitAtomicOrderExactOutput',
  'activity/batchCancelDerivativeOrders',
  'position/closePositionAndReduceOnlyOrders',
  'gridStrategy/createStrategy',
  'gridStrategy/removeStrategy',
  'airdrop/claim'
]

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
    Object.keys(mutation.payload || []).some((key) => {
      return keysToPersist.includes(key)
    })

  if (!shouldPersistState) {
    return
  }

  const updatedState = keysToPersist.reduce((stateObj, key) => {
    return {
      ...stateObj,
      [key]: mutation.payload[key] || state[key]
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
  const appStore = useAppStore()

  if (localState[store.$id]) {
    store.$state = { ...store.$state, ...localState[store.$id] }
  }

  store.$subscribe(persistState as SubscriptionCallback<StateTree>)

  store.$onAction(({ name, store: { $id }, after, onError }) => {
    after(() => {
      const type = `${$id}/${name}`

      if (actionsThatSetAppStateToBusy.includes(type)) {
        appStore.$patch({
          state: AppState.Idle
        })
      }
    })

    onError(() => {
      const type = `${$id}/${name}`

      if (actionsThatSetAppStateToBusy.includes(type)) {
        appStore.$patch({
          state: AppState.Idle
        })
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
