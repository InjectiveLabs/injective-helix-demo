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
  balancesWithToken: [] as BankBalanceWithToken[],
  ibcBalancesWithToken: [] as IbcBankBalanceWithToken[]
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances,
  ibcBalances: initialState.balances,
  balancesWithToken: initialState.balancesWithToken,
  ibcBalancesWithToken: initialState.ibcBalancesWithToken
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

  setBalancesWithToken(
    state: BankStoreState,
    balancesWithToken: BankBalanceWithToken[]
  ) {
    state.balancesWithToken = balancesWithToken
  },

  setIbcBalances(state: BankStoreState, ibcBalances: BankBalances) {
    state.ibcBalances = ibcBalances
  },

  setIbcBalancesWithToken(
    state: BankStoreState,
    ibcBalancesWithToken: IbcBankBalanceWithToken[]
  ) {
    state.ibcBalancesWithToken = ibcBalancesWithToken
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
    state.balancesWithToken = initialState.balancesWithToken
    state.ibcBalancesWithToken = initialState.ibcBalancesWithToken
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

    async fetchBalancesWithToken({ state, commit }) {
      const { balances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const balancesWithToken = (
        await Promise.all(
          Object.keys(balances).map(async (denom) => {
            return {
              denom,
              balance: balances[denom],
              token: await tokenService.getDenomToken(denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as BankBalanceWithToken[]

      commit('setBalancesWithToken', balancesWithToken)
    },

    async fetchIbcBalancesWithToken({ state, commit }) {
      const { ibcBalances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const ibcBalancesWithToken = (
        await Promise.all(
          Object.keys(ibcBalances).map(async (denom) => {
            const { baseDenom, path } = await tokenService.fetchDenomTrace(
              denom
            )

            return {
              denom,
              baseDenom,
              balance: ibcBalances[denom],
              channelId: path.replace('transfer/', ''),
              token: await tokenService.getDenomToken(denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as IbcBankBalanceWithToken[]

      commit('setIbcBalancesWithToken', ibcBalancesWithToken)
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
