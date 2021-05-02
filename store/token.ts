import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'nuxt-typed-vuex'
import {
  getTokenBalanceAndAllowance,
  setTokenAllowance
} from '~/app/services/tokens'
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from '~/app/utils/constants'
import { TokenAddress, TokenWithBalance } from '~/types'

const initialStateFactory = () => ({
  baseTokenWithBalance: (undefined as unknown) as TokenWithBalance,
  quoteTokenWithBalance: (undefined as unknown) as TokenWithBalance
})

const initialState = initialStateFactory()

export const state = () => ({
  baseTokenWithBalance: initialState.baseTokenWithBalance as TokenWithBalance,
  quoteTokenWithBalance: initialState.quoteTokenWithBalance as TokenWithBalance
})

export type TokenStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setTokensWithBalance(
    state: TokenStoreState,
    {
      baseTokenWithBalance,
      quoteTokenWithBalance
    }: {
      baseTokenWithBalance: TokenWithBalance
      quoteTokenWithBalance: TokenWithBalance
    }
  ) {
    state.baseTokenWithBalance = baseTokenWithBalance
    state.quoteTokenWithBalance = quoteTokenWithBalance
  },

  setQuoteTokenWithBalance(
    state: TokenStoreState,
    tokenWithBalance: TokenWithBalance
  ) {
    state.quoteTokenWithBalance = tokenWithBalance
  },

  setBaseTokenWithBalance(
    state: TokenStoreState,
    tokenWithBalance: TokenWithBalance
  ) {
    state.baseTokenWithBalance = tokenWithBalance
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.baseTokenWithBalance = initialState.baseTokenWithBalance
    state.quoteTokenWithBalance = initialState.quoteTokenWithBalance
  }
}

export const actions = actionTree(
  { state },
  {
    async getTokenBalanceAndAllowanceForMarket({ commit }) {
      const { address } = this.app.$accessor.wallet
      const { market } = this.app.$accessor.spot

      if (!market) {
        throw new Error('Market not found')
      }

      const { baseToken, quoteToken } = market

      const baseTokenWithBalance = (await getTokenBalanceAndAllowance({
        address,
        token: baseToken
      })) as TokenWithBalance
      const quoteTokenWithBalance = (await getTokenBalanceAndAllowance({
        address,
        token: quoteToken
      })) as TokenWithBalance

      commit('setTokensWithBalance', {
        baseTokenWithBalance,
        quoteTokenWithBalance
      })
    },

    async getTokenBalanceAndAllowanceForDerivativeMarket({ commit }) {
      const { address } = this.app.$accessor.wallet
      const { market } = this.app.$accessor.derivatives

      if (!market) {
        throw new Error('Market not found')
      }

      const { quoteToken } = market

      const quoteTokenWithBalance = (await getTokenBalanceAndAllowance({
        address,
        token: quoteToken
      })) as TokenWithBalance

      commit('setQuoteTokenWithBalance', quoteTokenWithBalance)
    },

    async setTokenAllowance({ state, commit }, tokenAddress: TokenAddress) {
      const { baseTokenWithBalance, quoteTokenWithBalance } = state
      const { address } = this.app.$accessor.wallet
      const { market } = this.app.$accessor.spot
      const { gasPrice } = this.app.$accessor.app
      const amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS

      if (!market) {
        throw new Error('Market not found')
      }

      await setTokenAllowance({
        address,
        amount: amount.toWei(),
        gasPrice: new BigNumberInBase(gasPrice).toWei(),
        tokenAddress
      })

      if (baseTokenWithBalance.address === tokenAddress) {
        commit('setBaseTokenWithBalance', {
          ...baseTokenWithBalance,
          allowance: UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toWei()
        })
      }

      if (quoteTokenWithBalance.address === tokenAddress) {
        commit('setQuoteTokenWithBalance', {
          ...quoteTokenWithBalance,
          allowance: UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toWei()
        })
      }
    }
  }
)
