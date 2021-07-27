import type { Plugin } from '@nuxt/types'
import merge from 'deepmerge'
import { localStorage } from '~/app/singletons/Storage'
import { AppState } from '~/types'

const mutationsToPersist = [
  'wallet/reset',
  'wallet/setAddress',
  'wallet/setWallet',
  'wallet/setInjectiveAddress',
  'wallet/setAddressConfirmation'
]

const actionsThatSetAppStateToBusy = [
  'account/deposit',
  'account/withdraw',
  'derivatives/cancelOrder',
  'derivatives/batchCancelOrder',
  'derivatives/submitLimitOrder',
  'derivatives/submitMarketOrder',
  'derivatives/closePosition',
  'derivatives/addMarginToPosition',
  'spot/cancelOrder',
  'spot/batchCancelOrder',
  'spot/submitLimitOrder',
  'spot/submitMarketOrder',
  'spot/closePosition'
]

const store: Plugin = ({ store, app }) => {
  const localState = localStorage.get('state') as any

  // Replace Local State
  store.replaceState(merge(store.state, localState))

  // Subscribe to Changes
  store.subscribe(({ type }) => {
    if (mutationsToPersist.includes(type)) {
      const stateToPersist = {
        wallet: {
          wallet: app.$accessor.wallet.wallet,
          addresses: app.$accessor.wallet.addresses,
          address: app.$accessor.wallet.address,
          injectiveAddress: app.$accessor.wallet.injectiveAddress,
          addressConfirmation: app.$accessor.wallet.addressConfirmation
        },

        account: {
          subaccountIds: app.$accessor.account.subaccountIds,
          subaccount: app.$accessor.account.subaccount
        }
      }

      localStorage.set('state', stateToPersist)
    }
  })

  store.subscribeAction({
    after: ({ type }: { type: string }) => {
      if (actionsThatSetAppStateToBusy.includes(type)) {
        app.$accessor.app.setAppState(AppState.Idle)
      }
    },
    error: ({ type }: { type: string }) => {
      if (actionsThatSetAppStateToBusy.includes(type)) {
        app.$accessor.app.setAppState(AppState.Idle)
      }
    }
  })
}

export default store
