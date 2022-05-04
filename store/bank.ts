import {
  BankBalances,
  BankBalanceWithToken,
  IbcBankBalanceWithToken,
  INJ_DENOM,
  Token
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import { bankActionService, bankService, tokenService } from '~/app/Services'
import { backupPromiseCall } from '~/app/utils/async'
import { MIN_INJ_REQUIRED_FOR_GAS } from '~/app/utils/constants'

const initialStateFactory = () => ({
  balances: {} as BankBalances,
  ibcBalances: {} as BankBalances,
  bankErc20BalancesWithToken: [] as BankBalanceWithToken[],
  bankIbcBalancesWithToken: [] as IbcBankBalanceWithToken[]
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances,
  ibcBalances: initialState.balances,
  bankErc20BalancesWithToken: initialState.bankErc20BalancesWithToken,
  bankIbcBalancesWithToken: initialState.bankIbcBalancesWithToken
})

export type BankStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  hasAnyBankBalance: (state: BankStoreState) => {
    return (
      Object.keys(state.balances).length > 0 ||
      Object.keys(state.ibcBalances).length > 0
    )
  },

  hasEnoughInjForGas: (state: BankStoreState) => {
    if (!state.balances[INJ_DENOM]) {
      return false
    }

    return new BigNumberInWei(state.balances[INJ_DENOM])
      .toBase()
      .gte(MIN_INJ_REQUIRED_FOR_GAS)
  },

  bankBalancesWithToken: (state: BankStoreState) => {
    return [
      ...state.bankErc20BalancesWithToken,
      ...state.bankIbcBalancesWithToken
    ]
  }
})

export const mutations = {
  setBalances(state: BankStoreState, balances: BankBalances) {
    state.balances = balances
  },

  setBankErc20BalancesWithToken(
    state: BankStoreState,
    bankErc20BalancesWithToken: BankBalanceWithToken[]
  ) {
    state.bankErc20BalancesWithToken = bankErc20BalancesWithToken
  },

  setIbcBalances(state: BankStoreState, ibcBalances: BankBalances) {
    state.ibcBalances = ibcBalances
  },

  setIbcBalancesWithToken(
    state: BankStoreState,
    bankIbcBalancesWithToken: IbcBankBalanceWithToken[]
  ) {
    state.bankIbcBalancesWithToken = bankIbcBalancesWithToken
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
    state.bankErc20BalancesWithToken = initialState.bankErc20BalancesWithToken
    state.bankIbcBalancesWithToken = initialState.bankIbcBalancesWithToken
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

      const { bankBalances, ibcBankBalances } = await bankService.fetchBalances(
        injectiveAddress
      )

      commit('setBalances', bankBalances)
      commit('setIbcBalances', ibcBankBalances)
    },

    async fetchBankBalancesWithToken({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const { bankBalances, ibcBankBalances } = await bankService.fetchBalances(
        injectiveAddress
      )

      commit('setBalances', bankBalances)
      commit('setIbcBalances', ibcBankBalances)

      const {
        bankBalancesWithToken,
        ibcBankBalancesWithToken
      } = await tokenService.getBalancesWithToken(bankBalances, ibcBankBalances)

      commit('setBankErc20BalancesWithToken', bankBalancesWithToken)
      commit('setIbcBalancesWithToken', ibcBankBalancesWithToken)
    },

    async transfer(
      _,
      {
        amount,
        denom,
        memo,
        destination,
        token
      }: {
        amount: BigNumberInBase
        denom: string
        memo?: string
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

      await bankActionService.transfer({
        address,
        injectiveAddress,
        destination,
        denom,
        memo,
        amount: amount.toWei(token.decimals).toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
