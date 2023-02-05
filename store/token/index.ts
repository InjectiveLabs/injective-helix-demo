import { defineStore } from 'pinia'
import {
  UiBankTransformer,
  INJ_COIN_GECKO_ID,
  TokenWithBalanceAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { awaitAll, BigNumberInBase } from '@injectivelabs/utils'
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
  tradeableErc20TokensWithBalanceAndPrice: TokenWithBalanceAndPrice[]
}

const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  btcUsdPrice: 0,
  injUsdPrice: 0,
  tokenUsdPriceMap: {},
  tradeableErc20TokensWithBalanceAndPrice: []
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tradeableTokens: (state) => {
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()

      const tradeableDenoms = [
        ...new Set([
          ...derivativeStore.tradeableDenoms,
          ...spotStore.tradeableDenoms
        ])
      ]

      return state.tokens.filter((token) => {
        return tradeableDenoms.includes(token.denom)
      })
    }
  },
  actions: {
    transfer,
    withdraw,
    setTokenAllowance,

    async fetchErc20TokensWithBalanceAndPrice() {
      const tokenStore = useTokenStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const tradeableErc20Tokens = tokenStore.tradeableTokens.filter(
        (token) => token.erc20Address
      )
      const tradeableTokensWithBalanceAndPrice = await awaitAll(
        tradeableErc20Tokens,
        async (token) => {
          return {
            ...token,
            balance: '0',
            allowance: '0',
            usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
          } as TokenWithBalanceAndPrice
        }
      )

      tokenStore.$patch({
        tradeableErc20TokensWithBalanceAndPrice:
          tradeableTokensWithBalanceAndPrice
      })
    },

    async updateErc20TokensWithBalanceAndPrice() {
      const tokenStore = useTokenStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const erc20TokenBalancesAreFetched =
        tokenStore.tradeableErc20TokensWithBalanceAndPrice.find(
          (token) =>
            new BigNumberInBase(token.balance).gt(0) ||
            new BigNumberInBase(token.allowance).gt(0)
        )

      if (erc20TokenBalancesAreFetched) {
        return
      }

      const updatedTradeableErc20TokensWithBalanceAndPrice = await awaitAll(
        tokenStore.tradeableErc20TokensWithBalanceAndPrice,
        async (token) => {
          const erc20Token = token as Erc20Token
          const tokenBalance = await web3Client.fetchTokenBalanceAndAllowance({
            address: walletStore.address,
            contractAddress: erc20Token.erc20Address
          })

          return {
            ...token,
            ...tokenBalance
          } as TokenWithBalanceAndPrice
        }
      )

      tokenStore.$patch({
        tradeableErc20TokensWithBalanceAndPrice:
          updatedTradeableErc20TokensWithBalanceAndPrice
      })
    },

    async fetchTokenUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => ({
          [coinGeckoId]: await tokenPrice.fetchUsdTokenPrice(coinGeckoId)
        }))
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (prices, tokenUsdPriceMap) => Object.assign(prices, tokenUsdPriceMap),
        {}
      )

      tokenStore.$patch({
        tokenUsdPriceMap
      })
    },

    async fetchInjUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        injUsdPrice: await tokenPrice.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      })
    },

    async fetchBitcoinUsdPrice() {
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
