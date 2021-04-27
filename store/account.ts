import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'nuxt-typed-vuex'
import {
  fetchSubaccounts,
  fetchSubaccount,
  deposit,
  streamSubaccountBalances
} from '~/app/services/account'
import { grpcSubaccountBalanceToUiSubaccountBalance } from '~/app/transformers/account'
import { backupPromiseCall } from '~/app/utils/async'
import { UiSubaccount, UiSubaccountBalance } from '~/types/subaccount'

const initialStateFactory = () => ({
  subaccountIds: [] as string[],
  subaccount: undefined as UiSubaccount | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountIds: initialState.subaccountIds as string[],
  subaccount: initialState.subaccount as UiSubaccount | undefined
})

export type AccountStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubacccountIds(state: AccountStoreState, subaccountIds: string[]) {
    state.subaccountIds = subaccountIds
  },

  setSubaccount(state: AccountStoreState, subaccount: UiSubaccount) {
    state.subaccount = subaccount
  },

  setSubaccountBalance(state: AccountStoreState, balance: UiSubaccountBalance) {
    if (!state.subaccount) {
      return
    }

    const currentBalance = [...state.subaccount.balances].find(
      (b) => b.denom === balance.denom
    )
    const balances = [...state.subaccount.balances].filter(
      (b) => b.denom !== balance.denom
    )
    const updatedBalance = {
      ...balance,
      totalBalance:
        balance.totalBalance ||
        (currentBalance ? currentBalance.totalBalance : '0'),
      availableBalance:
        balance.availableBalance ||
        (currentBalance ? currentBalance.availableBalance : '0')
    }

    state.subaccount = {
      ...state.subaccount,
      balances: [...balances, updatedBalance]
    }
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init({ dispatch }) {
      await dispatch('fetchSubaccounts')
    },

    async fetchSubaccounts({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const subaccountIds = await fetchSubaccounts(injectiveAddress)

      if (subaccountIds.length === 0) {
        return
      }

      const [subaccountId] = subaccountIds

      commit('setSubacccountIds', subaccountIds)
      commit('setSubaccount', await fetchSubaccount(subaccountId))

      await this.app.$accessor.spot.fetchSubaccountMarketTrades()
      await this.app.$accessor.spot.fetchSubaccountOrders()
      await this.app.$accessor.spot.fetchSubaccountTrades()
      await this.app.$accessor.spot.setSubaccountStreams()
    },

    async updateSubaccount({ commit, state }) {
      const { subaccount } = state

      if (!subaccount) {
        return
      }

      const { subaccountId } = subaccount

      commit('setSubaccount', await fetchSubaccount(subaccountId))
    },

    streamSubaccountBalances({ commit, state }) {
      const { subaccount } = state

      if (!subaccount) {
        return
      }

      streamSubaccountBalances(subaccount.subaccountId, ({ balance }) => {
        if (!balance) {
          return
        }

        commit(
          'setSubaccountBalance',
          grpcSubaccountBalanceToUiSubaccountBalance(balance)
        )
      })
    },

    async deposit(
      { state },
      { amount, denom }: { amount: BigNumberInBase; denom: string }
    ) {
      const { subaccount } = state
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (
        !address ||
        !isUserWalletConnected ||
        !subaccount ||
        !injectiveAddress
      ) {
        return
      }

      await deposit({
        address,
        denom,
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        amount: amount.toWei()
      })

      // await backupPromiseCall(() => dispatch('updateSubaccount'))
      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
