import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  fetchBalances,
  fetchBalancesWithTokenMetaData,
  transfer
} from '~/app/services/bank'
import { backupPromiseCall } from '~/app/utils/async'
import { BankBalances, BankBalanceWithTokenMetaData, Token } from '~/types'

const initialStateFactory = () => ({
  balances: {} as BankBalances,
  balancesWithTokenMetaData: [] as BankBalanceWithTokenMetaData[]
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances,
  balancesWithTokenMetaData: initialState.balancesWithTokenMetaData
})

export type BankStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setBalances(state: BankStoreState, balances: BankBalances) {
    state.balances = balances
  },

  setBalancesWithTokenMetaData(
    state: BankStoreState,
    balancesWithTokenMetaData: BankBalanceWithTokenMetaData[]
  ) {
    state.balancesWithTokenMetaData = balancesWithTokenMetaData
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
    state.balancesWithTokenMetaData = initialState.balancesWithTokenMetaData
  }
}

export const actions = actionTree(
  { state },
  {
    async init(_) {
      await this.app.$accessor.bank.fetchBalances()
    },

    async fetchBalances({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const balances = await fetchBalances(injectiveAddress)

      commit('setBalances', balances)
    },

    async fetchBalancesWithTokenMetaData({ state, commit }) {
      const { balances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }
      commit(
        'setBalancesWithTokenMetaData',
        await fetchBalancesWithTokenMetaData(balances)
      )
    },

    async transfer(
      _,
      {
        amount,
        denom,
        destination,
        token
      }: {
        amount: BigNumberInBase
        denom: string
        destination: string
        token: Token
      }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await transfer({
        address,
        injectiveAddress,
        destination,
        denom,
        amount: amount.toWei(token.decimals)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
