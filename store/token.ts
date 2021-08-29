import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  withdraw,
  getTokenBalanceAndAllowance,
  setTokenAllowance,
  transfer,
  validateTransferRestrictions
} from '~/app/services/tokens'
import { backupPromiseCall } from '~/app/utils/async'
import { UNLIMITED_ALLOWANCE } from '~/app/utils/constants'
import { Token, TokenWithBalance } from '~/types'

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
        return
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
        return
      }

      const { quoteToken } = market

      const quoteTokenWithBalance = (await getTokenBalanceAndAllowance({
        address,
        token: quoteToken
      })) as TokenWithBalance

      commit('setQuoteTokenWithBalance', quoteTokenWithBalance)
    },

    async setTokenAllowance(
      { state, commit },
      { address: tokenAddress }: TokenWithBalance
    ) {
      const { address } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app
      const amount = UNLIMITED_ALLOWANCE

      await this.app.$accessor.wallet.validate()

      await setTokenAllowance({
        address,
        tokenAddress,
        gasPrice,
        amount: (amount as BigNumberInWei).toFixed()
      })

      const { baseTokenWithBalance, quoteTokenWithBalance } = state

      if (baseTokenWithBalance.address === tokenAddress) {
        commit('setBaseTokenWithBalance', {
          ...baseTokenWithBalance,
          allowance: UNLIMITED_ALLOWANCE
        })
      }

      if (quoteTokenWithBalance.address === tokenAddress) {
        commit('setQuoteTokenWithBalance', {
          ...quoteTokenWithBalance,
          allowance: UNLIMITED_ALLOWANCE
        })
      }
    },

    async validateTransferRestrictions(_, { amount, token }) {
      await validateTransferRestrictions(amount, token)
    },

    async transfer(
      _,
      { amount, token }: { amount: BigNumberInBase; token: TokenWithBalance }
    ) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()
      await this.app.$accessor.token.validateTransferRestrictions({
        amount,
        token
      })

      await transfer({
        address,
        gasPrice,
        denom: token.denom,
        amount: new BigNumberInBase(
          amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
        )
          .toWei(token.decimals)
          .toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    },

    async withdraw(
      _,
      {
        amount,
        bridgeFee,
        token
      }: {
        amount: BigNumberInBase
        bridgeFee: BigNumberInBase
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

      await withdraw({
        address,
        injectiveAddress,
        denom: token.denom,
        destinationAddress: address,
        bridgeFee: bridgeFee.toWei(token.decimals).toFixed(),
        amount: amount.toWei(token.decimals).toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    }
  }
)
