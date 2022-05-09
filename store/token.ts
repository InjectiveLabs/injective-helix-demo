import {
  Token,
  TokenWithBalance,
  TokenWithBalanceAndPrice,
  UNLIMITED_ALLOWANCE,
  INJ_COIN_GECKO_ID,
  BankBalanceWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  peggyActionService,
  peggyContractActionService,
  tokenCoinGeckoService,
  tokenErc20ActionService,
  tokenErc20Service,
  tokenService
} from '~/app/Services'
import { BTC_COIN_GECKO_ID } from '~/app/utils/constants'
import { backupPromiseCall } from '~/app/utils/async'
import { TokenUsdPriceMap } from '~/types'

const initialStateFactory = () => ({
  erc20TokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  tokenUsdPriceMap: {} as TokenUsdPriceMap,
  btcUsdPrice: 0 as number,
  injUsdPrice: 0 as number
})

const initialState = initialStateFactory()

export const state = () => ({
  erc20TokensWithBalanceAndPriceFromBank: initialState.erc20TokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: initialState.ibcTokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  tokenUsdPriceMap: initialState.tokenUsdPriceMap as TokenUsdPriceMap,
  btcUsdPrice: initialState.btcUsdPrice as number,
  injUsdPrice: initialState.injUsdPrice as number
})

export type TokenStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
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

  setTokenUsdPriceMap(
    state: TokenStoreState,
    tokenUsdPriceMap: TokenUsdPriceMap
  ) {
    state.tokenUsdPriceMap = tokenUsdPriceMap
  },

  setBtcUsdPrice(state: TokenStoreState, btcUsdPrice: number) {
    state.btcUsdPrice = btcUsdPrice
  },

  setInjUsdPrice(state: TokenStoreState, injUsdPrice: number) {
    state.injUsdPrice = injUsdPrice
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.erc20TokensWithBalanceAndPriceFromBank =
      initialState.erc20TokensWithBalanceAndPriceFromBank
    state.ibcTokensWithBalanceAndPriceFromBank =
      initialState.ibcTokensWithBalanceAndPriceFromBank
    state.tokenUsdPriceMap = initialState.tokenUsdPriceMap
    state.injUsdPrice = initialState.injUsdPrice
    state.btcUsdPrice = initialState.btcUsdPrice
  }
}

export const actions = actionTree(
  { state },
  {
    async getErc20TokensWithBalanceAndPriceFromBankAndMarkets({ commit }) {
      const { markets: derivativeMarkets } = this.app.$accessor.derivatives
      const { markets: spotMarkets } = this.app.$accessor.spot
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
          usdPrice: await tokenCoinGeckoService.fetchUsdTokenPrice(
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

      const denomsInBankBalances = [
        ...ercTokensWithBalanceAndAllowance,
        ...ibcTokensWithBalanceAndPriceFromBank
      ].map((balance) => balance.denom)
      const spotBaseDenomsNotInBankBalances = spotMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.baseDenom)
        })
        .map((market) => market.baseDenom)
      const spotQuoteDenomsNotInBankBalances = spotMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.quoteDenom)
        })
        .map((market) => market.quoteDenom)
      const derivativeQuoteDenomsNotInBankBalances = derivativeMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.quoteDenom)
        })
        .map((market) => market.quoteDenom)
      const denomsNotInBankBalances = [
        ...spotBaseDenomsNotInBankBalances,
        ...spotQuoteDenomsNotInBankBalances,
        ...derivativeQuoteDenomsNotInBankBalances
      ]
      const uniqueDenomsNotInBankBalances = [
        ...new Set(denomsNotInBankBalances)
      ]
      const tradeableTokensWithBalanceAndPrice = await Promise.all(
        uniqueDenomsNotInBankBalances.map(async (denom) => {
          const token = await tokenService.getDenomToken(denom)
          const tokenWithBalance = await tokenErc20Service.fetchTokenBalanceAndAllowance(
            { address, token }
          )

          return {
            ...tokenWithBalance,
            usdPrice: await tokenCoinGeckoService.fetchUsdTokenPrice(
              token.coinGeckoId
            )
          } as TokenWithBalanceAndPrice
        })
      )

      const ercTokensWithBalanceAndAllowanceWithTradeableTokens = [
        ...new Map(
          [
            ...tradeableTokensWithBalanceAndPrice,
            ...ercTokensWithBalanceAndAllowance
          ].map((token) => [token.denom, token])
        ).values()
      ]

      commit(
        'setErc20TokensWithBalanceAndPriceFromBank',
        ercTokensWithBalanceAndAllowanceWithTradeableTokens
      )
      commit(
        'setIbcTokensWithBalanceAndPriceFromBank',
        ibcTokensWithBalanceAndPriceFromBank
      )
    },

    async getTokenUsdPriceMap({ commit }, coinGeckoIdList: string[]) {
      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => ({
          [coinGeckoId]: await tokenCoinGeckoService.fetchUsdTokenPrice(
            coinGeckoId
          )
        }))
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (list, tokenUsdPriceMap) => Object.assign(list, tokenUsdPriceMap),
        {}
      )

      commit('setTokenUsdPriceMap', tokenUsdPriceMap)
    },

    async getInjUsdPrice({ commit }) {
      commit(
        'setInjUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      )
    },

    async getBitcoinUsdPrice({ commit }) {
      commit(
        'setBtcUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPrice(BTC_COIN_GECKO_ID)
      )
    },

    async setTokenAllowance(
      { state, commit },
      { address: tokenAddress }: TokenWithBalance
    ) {
      const { address } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app

      await this.app.$accessor.wallet.validate()

      await tokenErc20ActionService.setTokenAllowance({
        address,
        tokenAddress,
        gasPrice,
        amount: UNLIMITED_ALLOWANCE.toFixed()
      })

      const { erc20TokensWithBalanceAndPriceFromBank } = state
      const token = erc20TokensWithBalanceAndPriceFromBank.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )
      const index = erc20TokensWithBalanceAndPriceFromBank.findIndex(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )

      if (!token || index < 0) {
        return
      }

      const erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance = [
        ...erc20TokensWithBalanceAndPriceFromBank
      ]
      erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance[index] = {
        ...token,
        allowance: UNLIMITED_ALLOWANCE.toString()
      }

      commit(
        'setErc20TokensWithBalanceAndPriceFromBank',
        erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance
      )
    },

    async transfer(
      _,
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await peggyContractActionService.transfer({
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
    }
  }
)
