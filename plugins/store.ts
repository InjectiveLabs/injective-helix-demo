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
      bannersViewed: []
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
    addressConfirmation: ''
  }
} as Record<string, Record<string, any>>

const actionsThatSetAppStateToBusy = [
  'peggy/transfer',
  'peggy/withdraw',
  'account/deposit',
  'account/transfer',
  'account/withdraw',
  'spot/cancelOrder',
  'spot/batchCancelOrder',
  'spot/submitLimitOrder',
  'derivative/cancelOrder',
  'position/closePosition',
  'spot/submitMarketOrder',
  'peggy/setTokenAllowance',
  'position/closeAllPosition',
  'spot/submitStopLimitOrder',
  'spot/submitStopMarketOrder',
  'derivative/batchCancelOrder',
  'derivative/submitLimitOrder',
  'derivative/submitMarketOrder',
  'position/addMarginToPosition',
  'activity/batchCancelSpotOrders',
  'derivative/submitStopLimitOrder',
  'derivative/submitStopMarketOrder',
  'activity/batchCancelDerivativeOrders',
  'position/closePositionAndReduceOnlyOrders'
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
