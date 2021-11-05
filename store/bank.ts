import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  fetchBalances,
  fetchBalancesWithTokenMetaData,
  fetchIbcSupplyWithTokenMeta,
  transfer
} from '~/app/services/bank'
import { backupPromiseCall } from '~/app/utils/async'
import {
  BankBalances,
  BankBalanceWithTokenMetaData,
  IbcBankBalanceWithTokenMetaData,
  Token
} from '~/types'

const initialStateFactory = () => ({
  balances: {} as BankBalances,
  ibcBalances: {} as BankBalances,
  balancesWithTokenMetaData: [] as BankBalanceWithTokenMetaData[],
  ibcBalancesWithTokenMetaData: [] as IbcBankBalanceWithTokenMetaData[]
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances,
  ibcBalances: initialState.balances,
  balancesWithTokenMetaData: initialState.balancesWithTokenMetaData,
  ibcBalancesWithTokenMetaData: initialState.ibcBalancesWithTokenMetaData
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

  setIbcBalances(state: BankStoreState, ibcBalances: BankBalances) {
    state.ibcBalances = ibcBalances
  },

  setIbcBalancesWithTokenMetaData(
    state: BankStoreState,
    ibcBalancesWithTokenMetaData: IbcBankBalanceWithTokenMetaData[]
  ) {
    state.ibcBalancesWithTokenMetaData = ibcBalancesWithTokenMetaData
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
    state.balancesWithTokenMetaData = initialState.balancesWithTokenMetaData
    state.ibcBalancesWithTokenMetaData =
      initialState.ibcBalancesWithTokenMetaData
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

      const { bankBalances, ibcBankBalances } = await fetchBalances(
        injectiveAddress
      )

      commit('setBalances', bankBalances)
      commit('setIbcBalances', ibcBankBalances)
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

    async fetchIbcBalancesWithTokenMetaData({ state, commit }) {
      const { ibcBalances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      commit(
        'setIbcBalancesWithTokenMetaData',
        await fetchIbcSupplyWithTokenMeta(ibcBalances)
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
