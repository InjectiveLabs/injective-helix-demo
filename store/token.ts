import {
  Token,
  TokenWithBalance,
  TokenWithBalanceAndPrice,
  UiSpotMarketWithTokenMeta,
  UNLIMITED_ALLOWANCE,
  INJ_COIN_GECKO_ID,
  UiDerivativeMarketWithTokenMeta
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  peggyActionServiceFactory,
  tokenCoinGeckoService,
  tokenErc20ActionServiceFactory,
  tokenErc20Service,
  tokenService
} from '~/app/Services'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  erc20TokensWithBalanceFromBank: [] as TokenWithBalance[],
  ibcTokensWithBalanceFromBank: [] as TokenWithBalance[],
  tokensWithPriceInUsd: {} as Record<string, string>,
  baseTokenWithBalance: (undefined as unknown) as TokenWithBalanceAndPrice,
  quoteTokenWithBalance: (undefined as unknown) as TokenWithBalanceAndPrice,
  injUsdtPrice: 0 as number
})

const initialState = initialStateFactory()

export const state = () => ({
  erc20TokensWithBalanceFromBank: initialState.erc20TokensWithBalanceFromBank as TokenWithBalance[],
  ibcTokensWithBalanceFromBank: initialState.ibcTokensWithBalanceFromBank as TokenWithBalance[],
  tokensWithPriceInUsd: initialState.tokensWithPriceInUsd as Record<
    string,
    string
  >,
  baseTokenWithBalance: initialState.baseTokenWithBalance as TokenWithBalanceAndPrice,
  quoteTokenWithBalance: initialState.quoteTokenWithBalance as TokenWithBalanceAndPrice,
  injUsdtPrice: initialState.injUsdtPrice as number
})

export type TokenStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setTokensWithBalance(
    state: TokenStoreState,
    {
      baseTokenWithBalanceAndPrice,
      quoteTokenWithBalanceAndPrice
    }: {
      baseTokenWithBalanceAndPrice: TokenWithBalanceAndPrice
      quoteTokenWithBalanceAndPrice: TokenWithBalanceAndPrice
    }
  ) {
    state.baseTokenWithBalance = baseTokenWithBalanceAndPrice
    state.quoteTokenWithBalance = quoteTokenWithBalanceAndPrice
  },

  setQuoteTokenWithBalance(
    state: TokenStoreState,
    tokenWithBalance: TokenWithBalanceAndPrice
  ) {
    state.quoteTokenWithBalance = tokenWithBalance
  },

  setBaseTokenWithBalance(
    state: TokenStoreState,
    tokenWithBalance: TokenWithBalanceAndPrice
  ) {
    state.baseTokenWithBalance = tokenWithBalance
  },

  setErc20TokensWithBalanceFromBank(
    state: TokenStoreState,
    erc20TokensWithBalanceFromBank: TokenWithBalance[]
  ) {
    state.erc20TokensWithBalanceFromBank = erc20TokensWithBalanceFromBank
  },

  setIbcTokensWithBalanceFromBank(
    state: TokenStoreState,
    ibcTokensWithBalanceFromBank: TokenWithBalance[]
  ) {
    state.ibcTokensWithBalanceFromBank = ibcTokensWithBalanceFromBank
  },

  setTokensWithPriceInUsd(
    state: TokenStoreState,
    tokensWithPriceInUsd: Record<string, string>
  ) {
    state.tokensWithPriceInUsd = tokensWithPriceInUsd
  },

  setInjUsdPrice(state: TokenStoreState, injUsdtPrice: number) {
    state.injUsdtPrice = injUsdtPrice
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.erc20TokensWithBalanceFromBank =
      initialState.erc20TokensWithBalanceFromBank
    state.ibcTokensWithBalanceFromBank =
      initialState.ibcTokensWithBalanceFromBank
    state.baseTokenWithBalance = initialState.baseTokenWithBalance
    state.quoteTokenWithBalance = initialState.quoteTokenWithBalance
    state.injUsdtPrice = initialState.injUsdtPrice
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

      const {
        balancesWithTokenMetaData,
        ibcBalancesWithTokenMetaData
      } = this.app.$accessor.bank

      if (balancesWithTokenMetaData.length === 0) {
        await this.app.$accessor.bank.fetchBalancesWithTokenMetaData()
      }

      if (ibcBalancesWithTokenMetaData.length === 0) {
        await this.app.$accessor.bank.fetchIbcBalancesWithTokenMetaData()
      }

      const {
        balancesWithTokenMetaData: newBalancesWithTokenMetaData,
        ibcBalancesWithTokenMetaData: newIbcBalancesWithTokenMetaData
      } = this.app.$accessor.bank

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        newBalancesWithTokenMetaData.map(async ({ token }) => {
          return (await tokenErc20Service.fetchTokenBalanceAndAllowance({
            address,
            token
          })) as TokenWithBalance
        })
      )

      const ibcTokensWithBalanceFromBank = await Promise.all(
        newIbcBalancesWithTokenMetaData.map(async ({ token }) => {
          return (await tokenErc20Service.fetchTokenBalanceAndAllowance({
            address: token.address,
            token
          })) as TokenWithBalance
        })
      )

      commit(
        'setErc20TokensWithBalanceFromBank',
        ercTokensWithBalanceAndAllowance
      )
      commit('setIbcTokensWithBalanceFromBank', ibcTokensWithBalanceFromBank)
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
          return await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
            token.coinGeckoId
          )
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
      const { address, isUserWalletConnected } = this.app.$accessor.wallet
      const { market: spotMarket } = this.app.$accessor.spot
      const { market: derivativeMarket } = this.app.$accessor.derivatives

      if (!address || !isUserWalletConnected) {
        return
      }

      if (!spotMarket && !derivativeMarket) {
        return
      }

      const market =
        spotMarket ||
        (derivativeMarket as
          | UiSpotMarketWithTokenMeta
          | UiDerivativeMarketWithTokenMeta)
      const { baseToken, quoteToken } = market

      if (
        baseToken.denom.startsWith('ibc') ||
        quoteToken.denom.startsWith('ibc')
      ) {
        return
      }

      const baseTokenWithBalance = (await tokenErc20Service.fetchTokenBalanceAndAllowance(
        {
          address,
          token: baseToken
        }
      )) as TokenWithBalance
      const quoteTokenWithBalance = (await tokenErc20Service.fetchTokenBalanceAndAllowance(
        {
          address,
          token: quoteToken
        }
      )) as TokenWithBalance

      const baseTokenWithBalanceAndPrice = {
        ...baseTokenWithBalance,
        usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          baseToken.coinGeckoId
        )
      } as TokenWithBalanceAndPrice

      const quoteTokenWithBalanceAndPrice = {
        ...quoteTokenWithBalance,
        usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          quoteToken.coinGeckoId
        )
      } as TokenWithBalanceAndPrice

      commit('setTokensWithBalance', {
        baseTokenWithBalanceAndPrice,
        quoteTokenWithBalanceAndPrice
      })
    },

    async getTokenBalanceAndAllowanceForMarket({ commit }) {
      const { address } = this.app.$accessor.wallet
      const { market } = this.app.$accessor.spot

      if (!market) {
        return
      }

      const { baseToken, quoteToken } = market

      const baseTokenWithBalance = (await tokenErc20Service.fetchTokenBalanceAndAllowance(
        {
          address,
          token: baseToken
        }
      )) as TokenWithBalance
      const quoteTokenWithBalance = (await tokenErc20Service.fetchTokenBalanceAndAllowance(
        {
          address,
          token: quoteToken
        }
      )) as TokenWithBalance

      const baseTokenWithBalanceAndPrice = {
        ...baseTokenWithBalance,
        usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          baseToken.coinGeckoId
        )
      } as TokenWithBalanceAndPrice

      const quoteTokenWithBalanceAndPrice = {
        ...quoteTokenWithBalance,
        usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          quoteToken.coinGeckoId
        )
      } as TokenWithBalanceAndPrice

      commit('setTokensWithBalance', {
        baseTokenWithBalanceAndPrice,
        quoteTokenWithBalanceAndPrice
      })
    },

    async getTokenBalanceAndAllowanceForDerivativeMarket({ commit }) {
      const { address } = this.app.$accessor.wallet
      const { market } = this.app.$accessor.derivatives

      if (!market) {
        return
      }

      const { quoteToken } = market

      const quoteTokenWithBalance = (await tokenErc20Service.fetchTokenBalanceAndAllowance(
        {
          address,
          token: quoteToken
        }
      )) as TokenWithBalance
      const quoteTokenWithBalanceAndPrice = {
        ...quoteTokenWithBalance,
        usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          quoteToken.coinGeckoId
        )
      } as TokenWithBalanceAndPrice

      commit('setQuoteTokenWithBalance', quoteTokenWithBalanceAndPrice)
    },

    async getInjUsdPrice({ commit }) {
      commit(
        'setInjUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          INJ_COIN_GECKO_ID
        )
      )
    },

    async setTokenAllowance(
      { state, commit },
      { address: tokenAddress }: TokenWithBalance
    ) {
      const { address } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app
      const tokenErc20ActionService = tokenErc20ActionServiceFactory()

      await this.app.$accessor.wallet.validate()

      await tokenErc20ActionService.setTokenAllowance({
        address,
        tokenAddress,
        gasPrice,
        amount: UNLIMITED_ALLOWANCE.toFixed()
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
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app
      const peggyActionService = peggyActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await peggyActionService.transfer({
        address,
        gasPrice,
        destinationAddress: injectiveAddress,
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
      const peggyActionService = peggyActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await peggyActionService.withdraw({
        address,
        injectiveAddress,
        denom: token.denom,
        destinationAddress: address,
        amount: amount.toWei(token.decimals).toFixed(0),
        bridgeFee: new BigNumberInWei(
          bridgeFee.toWei(token.decimals).toFixed(0)
        ).toFixed(0)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
    }
  }
)
