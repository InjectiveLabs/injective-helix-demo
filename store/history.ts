import { actionTree, getterTree } from 'typed-vuex'
import { UiSpotTrade, UiDerivativeTrade, UiSubaccountTransfer } from '~/types'
import {
  fetchSubaccountTransfers,
  fetchSubaccountTrades
} from '~/app/services/history'

const initialStateFactory = () => ({
  subaccountTrades: [] as Array<UiSpotTrade | UiDerivativeTrade>,
  subaccountTransfers: [] as Array<UiSubaccountTransfer>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountTrades: initialState.subaccountTrades as Array<
    UiSpotTrade | UiDerivativeTrade
  >,
  subaccountTransfers: initialState.subaccountTransfers as UiSubaccountTransfer[]
})

export type HistoryStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubaccountTrades(
    state: HistoryStoreState,
    trades: Array<UiSpotTrade | UiDerivativeTrade>
  ) {
    state.subaccountTrades = trades
  },

  setSubaccountTransfers(
    state: HistoryStoreState,
    history: Array<UiSubaccountTransfer>
  ) {
    state.subaccountTransfers = history
  },

  reset(state: HistoryStoreState) {
    state.subaccountTrades = []
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('reset')
    },

    async init(_) {
      await this.app.$accessor.history.fetchTrades()
      await this.app.$accessor.history.fetchTransfers()
    },

    async fetchTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountTrades',
        await fetchSubaccountTrades({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchTransfers({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountTransfers',
        await fetchSubaccountTransfers(subaccount.subaccountId)
      )
    }
  }
)
