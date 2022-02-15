import {
  BankBalances,
  BankBalanceWithToken,
  IbcBankBalanceWithToken,
  Token
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  bankActionServiceFactory,
  bankService,
  tokenService
} from '~/app/Services'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  balances: {} as BankBalances,
  ibcBalances: {} as BankBalances,
  bankErc20BalancesWithToken: [] as BankBalanceWithToken[],
  bankIbcBalancesWithToken: [] as IbcBankBalanceWithToken[]
})

//   balancesWithToken: [] as BankBalanceWithToken[],
// ibcBalancesWithToken: [] as IbcBankBalanceWithToken[]

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

      const bankErc20BalancesWithToken = (
        await Promise.all(
          Object.keys(bankBalances).map(async (denom) => {
            return {
              denom,
              balance: bankBalances[denom],
              token: await tokenService.getDenomToken(denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as BankBalanceWithToken[]

      const bankIbcBalancesWithToken = (
        await Promise.all(
          Object.keys(ibcBankBalances).map(async (denom) => {
            const { baseDenom, path } = await tokenService.fetchDenomTrace(
              denom
            )

            return {
              denom,
              baseDenom,
              balance: ibcBankBalances[denom],
              channelId: path.replace('transfer/', ''),
              token: await tokenService.getDenomToken(denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as IbcBankBalanceWithToken[]

      commit('setBankErc20BalancesWithToken', bankErc20BalancesWithToken)
      commit('setIbcBalancesWithToken', bankIbcBalancesWithToken)
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
      const bankActionService = bankActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await bankActionService.transfer({
        address,
        injectiveAddress,
        destination,
        denom,
        amount: amount.toWei(token.decimals).toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
