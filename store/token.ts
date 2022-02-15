import {
  Token,
  TokenWithBalance,
  TokenWithBalanceAndPrice,
  UiSpotMarketWithToken,
  UNLIMITED_ALLOWANCE,
  INJ_COIN_GECKO_ID,
  UiDerivativeMarketWithToken,
  BankBalanceWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  peggyActionServiceFactory,
  tokenCoinGeckoService,
  tokenErc20ActionServiceFactory,
  tokenErc20Service
} from '~/app/Services'
import { BTC_COIN_GECKO_ID } from '~/app/utils/constants'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  erc20TokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  baseTokenWithBalance: (undefined as unknown) as TokenWithBalanceAndPrice,
  quoteTokenWithBalance: (undefined as unknown) as TokenWithBalanceAndPrice,
  btcUsdPrice: 0 as number,
  injUsdtPrice: 0 as number
})

const initialState = initialStateFactory()

export const state = () => ({
  erc20TokensWithBalanceAndPriceFromBank: initialState.erc20TokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: initialState.ibcTokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  baseTokenWithBalance: initialState.baseTokenWithBalance as TokenWithBalanceAndPrice,
  quoteTokenWithBalance: initialState.quoteTokenWithBalance as TokenWithBalanceAndPrice,
  btcUsdPrice: initialState.btcUsdPrice as number,
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

  setErc20TokensWithBalanceAndPriceFromBank(
    state: TokenStoreState,
    erc20TokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ) {
    state.erc20TokensWithBalanceAndPriceFromBank = erc20TokensWithBalanceAndPriceFromBank
  },

  setIbcTokensWithBalanceAndPriceFromBank(
    state: TokenStoreState,
    ibcTokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ) {
    state.ibcTokensWithBalanceAndPriceFromBank = ibcTokensWithBalanceAndPriceFromBank
  },

  setBtcUsdPrice(state: TokenStoreState, btcUsdPrice: number) {
    state.btcUsdPrice = btcUsdPrice
  },

  setInjUsdPrice(state: TokenStoreState, injUsdtPrice: number) {
    state.injUsdtPrice = injUsdtPrice
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.erc20TokensWithBalanceAndPriceFromBank =
      initialState.erc20TokensWithBalanceAndPriceFromBank
    state.ibcTokensWithBalanceAndPriceFromBank =
      initialState.ibcTokensWithBalanceAndPriceFromBank
    state.baseTokenWithBalance = initialState.baseTokenWithBalance
    state.quoteTokenWithBalance = initialState.quoteTokenWithBalance
    state.injUsdtPrice = initialState.injUsdtPrice
  }
}

export const actions = actionTree(
  { state },
  {
    async getErc20TokensWithBalanceAndPriceFromBank({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const {
        bankErc20BalancesWithToken,
        bankIbcBalancesWithToken
      } = this.app.$accessor.bank

      const tokenToTokenWithBalanceAndAllowance = async ({
        token
      }: BankBalanceWithToken) => {
        const tokenWithBalance = await tokenErc20Service.fetchTokenBalanceAndAllowance(
          {
            address,
            token
          }
        )

        return {
          ...tokenWithBalance,
          usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
            token.coinGeckoId
          )
        } as TokenWithBalanceAndPrice
      }

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        bankErc20BalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      const ibcTokensWithBalanceAndPriceFromBank = await Promise.all(
        bankIbcBalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      commit(
        'setErc20TokensWithBalanceAndPriceFromBank',
        ercTokensWithBalanceAndAllowance
      )
      commit(
        'setIbcTokensWithBalanceAndPriceFromBank',
        ibcTokensWithBalanceAndPriceFromBank
      )
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
          | UiSpotMarketWithToken
          | UiDerivativeMarketWithToken)
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

    async getBitcoinUsdPrice({ commit }) {
      commit(
        'setBtcUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          BTC_COIN_GECKO_ID
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
