import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  fetchSubaccounts,
  fetchSubaccount,
  deposit,
  withdraw,
  streamSubaccountBalances
} from '~/app/services/account'
import { grpcSubaccountBalanceToUiSubaccountBalance } from '~/app/transformers/account'
import { backupPromiseCall } from '~/app/utils/async'
import { ZERO_TO_STRING } from '~/app/utils/constants'
import { Token } from '~/types'
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
        (currentBalance ? currentBalance.totalBalance : ZERO_TO_STRING),
      availableBalance:
        balance.availableBalance ||
        (currentBalance ? currentBalance.availableBalance : ZERO_TO_STRING)
    }

    state.subaccount = {
      ...state.subaccount,
      balances: [...balances, updatedBalance]
    }
  },

  reset(state: AccountStoreState) {
    const initialState = initialStateFactory()

    state.subaccount = initialState.subaccount
    state.subaccountIds = initialState.subaccountIds
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {
      await this.app.$accessor.account.fetchSubaccounts()
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
      await this.app.$accessor.spot.streamSubaccountOrders()
      await this.app.$accessor.spot.streamSubaccountTrades()

      await this.app.$accessor.derivatives.fetchSubaccountMarketTrades()
      await this.app.$accessor.derivatives.fetchSubaccountOrders()
      await this.app.$accessor.derivatives.fetchSubaccountTrades()
      await this.app.$accessor.derivatives.fetchSubaccountPosition()
      await this.app.$accessor.derivatives.streamSubaccountOrders()
      await this.app.$accessor.derivatives.streamSubaccountPositions()
      await this.app.$accessor.derivatives.streamSubaccountTrades()
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

      streamSubaccountBalances({
        subaccountId: subaccount.subaccountId,
        callback: ({ balance }) => {
          if (!balance) {
            return
          }

          commit(
            'setSubaccountBalance',
            grpcSubaccountBalanceToUiSubaccountBalance(balance)
          )
        }
      })
    },

    async deposit(
      { state },
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const { subaccount } = state
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!subaccount || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await deposit({
        address,
        injectiveAddress,
        denom: token.denom,
        subaccountId: subaccount.subaccountId,
        amount: amount.toWei(token.decimals)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await backupPromiseCall(() =>
        this.app.$accessor.account.updateSubaccount()
      )
    },

    async withdraw(
      { state },
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const { subaccount } = state
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!subaccount || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await withdraw({
        address,
        injectiveAddress,
        denom: token.denom,
        subaccountId: subaccount.subaccountId,
        amount: amount.toWei(token.decimals)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await backupPromiseCall(() =>
        this.app.$accessor.account.updateSubaccount()
      )
    }
  }
)
