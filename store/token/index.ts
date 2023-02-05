import { defineStore } from 'pinia'
import {
  BankBalanceWithToken,
  TokenWithBalanceAndPrice,
  INJ_COIN_GECKO_ID,
  UiBankTransformer
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Erc20Token, Token } from '@injectivelabs/token-metadata'
import { bankApi, tokenPrice, tokenService, web3Client } from '@/app/Services'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { setTokenAllowance, transfer, withdraw } from '@/store/token/message'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  tokens: Token[]
  btcUsdPrice: number
  injUsdPrice: number
  tokenUsdPriceMap: TokenUsdPriceMap
  erc20TokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ibcTokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
}
const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  btcUsdPrice: 0,
  injUsdPrice: 0,
  tokenUsdPriceMap: {},
  ibcTokensWithBalanceAndPriceFromBank: [],
  erc20TokensWithBalanceAndPriceFromBank: []
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  actions: {
    transfer,
    withdraw,
    setTokenAllowance,

    async getErc20TokensWithBalanceAndPriceFromBankAndMarkets() {
      const tokenStore = useTokenStore()
      const bankStore = useBankStore()
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const tokenToTokenWithBalanceAndAllowance = async ({
        token
      }: BankBalanceWithToken) => {
        return {
          ...token,
          balance: '0',
          allowance: '0',
          usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
        } as TokenWithBalanceAndPrice
      }

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        bankStore.bankErc20BalancesWithToken.map(
          tokenToTokenWithBalanceAndAllowance
        )
      )

      const ibcTokensWithBalanceAndPriceFromBank = await Promise.all(
        bankStore.bankIbcBalancesWithToken.map(
          tokenToTokenWithBalanceAndAllowance
        )
      )

      const denomsInBankBalances = [
        ...ercTokensWithBalanceAndAllowance,
        ...ibcTokensWithBalanceAndPriceFromBank
      ].map((balance) => balance.denom)

      const spotBaseDenomsNotInBankBalances = spotStore.markets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.baseDenom)
        })
        .map((market) => market.baseDenom)
      const spotQuoteDenomsNotInBankBalances = spotStore.markets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.quoteDenom)
        })
        .map((market) => market.quoteDenom)
      const derivativeQuoteDenomsNotInBankBalances = derivativeStore.markets
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

          return {
            ...token,
            balance: '0',
            allowance: '0',
            usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
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
      ].filter(({ erc20Address }) => erc20Address)

      tokenStore.$patch({
        ibcTokensWithBalanceAndPriceFromBank,
        erc20TokensWithBalanceAndPriceFromBank:
          ercTokensWithBalanceAndAllowanceWithTradeableTokens
      })
    },

    async updateErc20TokensBalanceAndAllowanceFromBankAndMarkets() {
      const tokenStore = useTokenStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const erc20TokenBalancesAreFetched =
        tokenStore.erc20TokensWithBalanceAndPriceFromBank.find(
          (token) =>
            new BigNumberInBase(token.balance).gt(0) ||
            new BigNumberInBase(token.allowance).gt(0)
        )

      if (erc20TokenBalancesAreFetched) {
        return
      }

      const updatedErc20TokensWithBalanceAndPriceFromBank = await Promise.all(
        tokenStore.erc20TokensWithBalanceAndPriceFromBank.map(async (token) => {
          const erc20Token = token as Erc20Token
          const tokenBalance = await web3Client.fetchTokenBalanceAndAllowance({
            address: walletStore.address,
            contractAddress: erc20Token.erc20Address
          })

          return {
            ...token,
            ...tokenBalance
          }
        })
      )

      tokenStore.$patch({
        erc20TokensWithBalanceAndPriceFromBank:
          updatedErc20TokensWithBalanceAndPriceFromBank
      })
    },

    async getTokenUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => ({
          [coinGeckoId]: await tokenPrice.fetchUsdTokenPrice(coinGeckoId)
        }))
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (list, tokenUsdPriceMap) => Object.assign(list, tokenUsdPriceMap),
        {}
      )

      tokenStore.$patch({
        tokenUsdPriceMap
      })
    },

    async getInjUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        injUsdPrice: await tokenPrice.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      })
    },

    async getBitcoinUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        btcUsdPrice: await tokenPrice.fetchUsdTokenPrice(BTC_COIN_GECKO_ID)
      })
    },

    async fetchSupplyTokenMeta() {
      const tokenStore = useTokenStore()

      const { supply } = await bankApi.fetchTotalSupply()

      const { bankSupply, ibcBankSupply } =
        UiBankTransformer.supplyToUiSupply(supply)

      const tokens = await tokenService.getCoinsToken([
        ...bankSupply,
        ...ibcBankSupply
      ])

      tokenStore.$patch({
        tokens
      })
    }
  }
})
