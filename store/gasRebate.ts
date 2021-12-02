import { actionTree, getterTree } from 'typed-vuex'
import { UiSpotTrade, UiDerivativeTrade } from '~/types'
import { fetchSubaccountTrades } from '~/app/services/history'
import {
  fetchUserTransactionMessages,
  fetchUserDeposits,
  redeem
} from '~/app/services/gasRebate'
import { UserDeposit } from '~/types/gql'
import { UserTransactionMessage } from '~/types/gasRebate'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  trades: [] as Array<UiSpotTrade | UiDerivativeTrade>,
  transactionsMessages: [] as Array<UserTransactionMessage>,
  deposits: [] as Array<UserDeposit>
})

const initialState = initialStateFactory()

export const state = () => ({
  trades: initialState.trades as Array<UiSpotTrade | UiDerivativeTrade>,
  transactionsMessages: initialState.transactionsMessages as UserTransactionMessage[],
  deposits: initialState.deposits as UserDeposit[]
})

export type GasRebateStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setTrades(
    state: GasRebateStoreState,
    trades: Array<UiSpotTrade | UiDerivativeTrade>
  ) {
    state.trades = trades
  },

  setTransactionsMessages(
    state: GasRebateStoreState,
    transactionsMessages: Array<UserTransactionMessage>
  ) {
    state.transactionsMessages = transactionsMessages
  },

  setDeposits(state: GasRebateStoreState, deposits: Array<UserDeposit>) {
    state.deposits = deposits
  },

  reset(state: GasRebateStoreState) {
    state.trades = []
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('reset')
    },

    async init(_) {
      await this.app.$accessor.gasRebate.fetchTrades()
      await this.app.$accessor.gasRebate.fetchTransactions()
      await this.app.$accessor.gasRebate.fetchDeposits()
      await this.app.$accessor.account.fetchSubaccountsBalances()
    },

    async fetchTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setTrades',
        await fetchSubaccountTrades({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchTransactions({ commit }) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      commit(
        'setTransactionsMessages',
        await fetchUserTransactionMessages(injectiveAddress)
      )
    },

    async fetchDeposits({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !address) {
        return
      }

      commit('setDeposits', await fetchUserDeposits(address))
    },

    async redeem(_) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      await redeem({
        address,
        injectiveAddress
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
