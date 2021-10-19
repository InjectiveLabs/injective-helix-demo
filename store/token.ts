import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  withdraw,
  getTokenBalanceAndAllowance,
  setTokenAllowance,
  transfer,
  getUsdtTokenPriceFromCoinGecko,
  validateTransferRestrictions
} from '~/app/services/tokens'
import { backupPromiseCall } from '~/app/utils/async'
import { UNLIMITED_ALLOWANCE } from '~/app/utils/constants'
import {
  Token,
  TokenWithBalance,
  UiDerivativeMarket,
  UiSpotMarket
} from '~/types'

const initialStateFactory = () => ({
  erc20TokensWithBalanceFromBank: [] as TokenWithBalance[],
  tokensWithPriceInUsd: {} as Record<string, string>,
  baseTokenWithBalance: (undefined as unknown) as TokenWithBalance,
  quoteTokenWithBalance: (undefined as unknown) as TokenWithBalance
})

const initialState = initialStateFactory()

export const state = () => ({
  erc20TokensWithBalanceFromBank: initialState.erc20TokensWithBalanceFromBank as TokenWithBalance[],
  tokensWithPriceInUsd: initialState.tokensWithPriceInUsd as Record<
    string,
    string
  >,
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

  setErc20TokensWithBalanceFromBank(
    state: TokenStoreState,
    erc20TokensWithBalanceFromBank: TokenWithBalance[]
  ) {
    state.erc20TokensWithBalanceFromBank = erc20TokensWithBalanceFromBank
  },

  setTokensWithPriceInUsd(
    state: TokenStoreState,
    tokensWithPriceInUsd: Record<string, string>
  ) {
    state.tokensWithPriceInUsd = tokensWithPriceInUsd
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.erc20TokensWithBalanceFromBank =
      initialState.erc20TokensWithBalanceFromBank
    state.baseTokenWithBalance = initialState.baseTokenWithBalance
    state.quoteTokenWithBalance = initialState.quoteTokenWithBalance
  }
}

export const actions = actionTree(
  { state },
  {
    async getAllTokenWithBalanceAndAllowance({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const { balancesWithTokenMetaData } = this.app.$accessor.bank

      if (balancesWithTokenMetaData.length === 0) {
        await this.app.$accessor.bank.fetchBalancesWithTokenMetaData()
      }

      const {
        balancesWithTokenMetaData: newBalancesWithTokenMetaData
      } = this.app.$accessor.bank

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        newBalancesWithTokenMetaData.map(async ({ token }) => {
          return (await getTokenBalanceAndAllowance({
            address,
            token
          })) as TokenWithBalance
        })
      )

      commit(
        'setErc20TokensWithBalanceFromBank',
        ercTokensWithBalanceAndAllowance
      )
    },

    async getAllTokenWithPriceInUsd({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const { balancesWithTokenMetaData } = this.app.$accessor.bank

      if (balancesWithTokenMetaData.length === 0) {
        await this.app.$accessor.bank.fetchBalancesWithTokenMetaData()
      }

      const {
        balancesWithTokenMetaData: newBalancesWithTokenMetaData
      } = this.app.$accessor.bank

      const tokensPriceInUsd = await Promise.all(
        newBalancesWithTokenMetaData.map(async ({ token }) => {
          return await getUsdtTokenPriceFromCoinGecko(token.coinGeckoId)
        })
      )

      const tokensWithPriceInUsd = tokensPriceInUsd.reduce(
        (tokens, price, index) => {
          return {
            ...tokens,
            [newBalancesWithTokenMetaData[index].denom]: price
          }
        },
        {}
      )

      commit('setTokensWithPriceInUsd', tokensWithPriceInUsd)
    },

    async getTokenBalanceAndAllowance({ commit }) {
      const { address } = this.app.$accessor.wallet
      const { market: spotMarket } = this.app.$accessor.spot
      const { market: derivativeMarket } = this.app.$accessor.derivatives

      if (!spotMarket && !derivativeMarket) {
        return
      }

      const market =
        spotMarket || (derivativeMarket as UiSpotMarket | UiDerivativeMarket)
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
        amount: amount.toWei(token.decimals),
        bridgeFee: new BigNumberInWei(
          bridgeFee.toWei(token.decimals).toFixed(0)
        )
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    }
  }
)
