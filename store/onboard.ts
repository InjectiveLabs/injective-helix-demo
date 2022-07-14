import { actionTree, getterTree } from 'typed-vuex'
import {
  UiDerivativeTrade,
  UiSpotTrade,
  UiSubaccountTransfer,
  UiAccountTransformer
} from '@injectivelabs/sdk-ui-ts'
import {
  exchangeDerivativesApi,
  exchangeSpotApi,
  exchangeAccountApi
} from '~/app/Services'

const initialStateFactory = () => ({
  trades: [] as Array<UiSpotTrade | UiDerivativeTrade>,
  subaccountTransfers: [] as UiSubaccountTransfer[]
})

const initialState = initialStateFactory()

export const state = () => ({
  trades: initialState.trades as Array<UiSpotTrade | UiDerivativeTrade>,
  subaccountTransfers:
    initialState.subaccountTransfers as UiSubaccountTransfer[]
})

export type OnboardStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  hasMadeAnyTransfers: (state: OnboardStoreState) => {
    return state.subaccountTransfers.length > 0
  },

  hasMadeAnyTrades: (state: OnboardStoreState) => {
    return state.trades.length > 0
  }
})

export const mutations = {
  setTrades(
    state: OnboardStoreState,
    trades: Array<UiSpotTrade | UiDerivativeTrade>
  ) {
    state.trades = trades
  },

  setSubaccountTransfers(
    state: OnboardStoreState,
    subaccountTransfers: UiSubaccountTransfer[]
  ) {
    state.subaccountTransfers = subaccountTransfers
  },

  reset(state: OnboardStoreState) {
    const initialState = initialStateFactory()

    state.trades = initialState.trades
    state.subaccountTransfers = initialState.subaccountTransfers
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('reset')
    },

    async init(_) {
      await this.app.$accessor.onboard.fetchTrades()
      await this.app.$accessor.onboard.fetchTransfers()
    },

    async fetchTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const spotTrades = await exchangeSpotApi.fetchTrades({
        subaccountId: subaccount.subaccountId
      })
      const derivativeTrades = await exchangeDerivativesApi.fetchTrades({
        subaccountId: subaccount.subaccountId
      })

      commit('setTrades', [...spotTrades, ...derivativeTrades])
    },

    async fetchTransfers({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !address || !subaccount) {
        return
      }

      const transfers = await exchangeAccountApi.fetchSubaccountHistory({
        subaccountId: subaccount.subaccountId
      })
      const uiTransfers = transfers.map(
        UiAccountTransformer.grpcAccountTransferToUiAccountTransfer
      )

      commit('setSubaccountTransfers', uiTransfers)
    }
  }
)
