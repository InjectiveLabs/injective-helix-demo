import {
  BigNumberInBase,
  BigNumberInWei,
  DEFAULT_BRIDGE_FEE_PRICE
} from '@injectivelabs/utils'
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
        amount: amount as BigNumberInWei,
        gasPrice: new BigNumberInBase(gasPrice).toWei()
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
      await validateTransferRestrictions(amount, token)

      await transfer({
        address,
        denom: token.denom,
        gasPrice: new BigNumberInBase(gasPrice).toWei(),
        amount: amount.toWei(token.decimals)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    },

    async withdraw(
      _,
      {
        amount,
        token
      }: {
        amount: BigNumberInBase
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
        feePrice: new BigNumberInBase(
          new BigNumberInWei(DEFAULT_BRIDGE_FEE_PRICE).toBase()
        )
          .toWei(token.decimals)
          .toFixed(),
        destinationAddress: address,
        amount: amount.toWei(token.decimals)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    }
  }
)
