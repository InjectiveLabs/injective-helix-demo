import { defineStore } from 'pinia'
import { TokenType, type Token } from '@injectivelabs/token-metadata'
import { BigNumberInWei, awaitForAll } from '@injectivelabs/utils'
import { bankApi, denomClient, tokenPrice } from '@/app/Services'
import { SymbolWithMarketId, TokenUsdPriceMap } from '@/types'
import { TALIS_METADATA } from '@/app/data/market'

type TokenStoreState = {
  tokens: Token[]
  unknownTokens: Token[]
  tokenUsdPriceMap: TokenUsdPriceMap
}

const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  unknownTokens: [],
  tokenUsdPriceMap: {}
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tokenUsdPrice: (state) => (coinGeckoId: string) => {
      return state.tokenUsdPriceMap[coinGeckoId] || 0
    },

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
    async fetchTokensUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      if (coinGeckoIdList.length === 0) {
        return
      }

      const coinGeckoIdsNotInStore = [
        ...new Set(coinGeckoIdList.filter((id) => id))
      ].filter(
        (coinGeckoId) =>
          !Object.keys(tokenStore.tokenUsdPriceMap).includes(coinGeckoId)
      )

      const tokenUsdPriceMap = await tokenPrice.fetchUsdTokensPrice(
        coinGeckoIdsNotInStore
      )

      tokenStore.$patch({
        tokenUsdPriceMap: {
          ...tokenUsdPriceMap,
          ...tokenStore.tokenUsdPriceMap
        }
      })
    },

    async fetchLastTradedPrice(symbolWithMarketId: SymbolWithMarketId[]) {
      const spotStore = useSpotStore()
      const tokenStore = useTokenStore()

      const priceMapsArray = await awaitForAll(
        symbolWithMarketId,
        async ({
          marketId,
          baseDecimals,
          quoteDecimals,
          coingeckoId
        }: SymbolWithMarketId) => {
          const lastTradedPrice = await spotStore.fetchLastTrade({
            marketId
          })

          return {
            [coingeckoId]: new BigNumberInWei(lastTradedPrice.price)
              .toBase(quoteDecimals - baseDecimals)
              .toNumber()
          }
        }
      )

      const priceMap = priceMapsArray.reduce((acc, priceMap) => {
        return { ...acc, ...priceMap }
      }, {} as TokenUsdPriceMap)

      tokenStore.$patch({
        tokenUsdPriceMap: { ...tokenStore.tokenUsdPriceMap, ...priceMap }
      })
    },

    async fetchTokens() {
      const tokenStore = useTokenStore()

      if (tokenStore.tokens.length > 0) {
        return
      }

      const { supply } = await bankApi.fetchTotalSupply({ limit: 1000 })

      const supplyWithTokensOrUnknown = supply.map((coin) =>
        denomClient.getDenomTokenStaticOrUnknown(coin.denom)
      ) as Token[]

      const supplyWithToken = supplyWithTokensOrUnknown.filter(
        (token) => token.tokenType !== TokenType.Unknown
      )

      // REMOVE WHEN COINGECKO ADDS TALIS
      const supplyWithTokenWithTalis = supplyWithToken.map((token) => {
        if (token.symbol === TALIS_METADATA.symbol) {
          return { ...token, coinGeckoId: TALIS_METADATA.coingeckoId } as Token
        } else {
          return token
        }
      })

      const supplyWithUnknownTokens = supplyWithTokensOrUnknown.filter(
        (token) => token.tokenType === TokenType.Unknown
      )

      tokenStore.$patch({
        tokens: supplyWithTokenWithTalis,
        unknownTokens: supplyWithUnknownTokens
      })
    },

    /**
     * Used to fetch unknown token metadata
     * from external/internal API sources
     * for particular set of denoms (account page/single asset page)
     **/
    async fetchUnknownTokensList(denoms: string[]) {
      const tokenStore = useTokenStore()

      const unknownTokens = tokenStore.unknownTokens.filter((asset) =>
        denoms.includes(asset.denom)
      )

      if (!unknownTokens.length) {
        return
      }

      const tokensList = await awaitForAll(unknownTokens, async (token) => ({
        ...token,
        token: (await denomClient.getDenomToken(token.denom)) || token
      }))

      const unknownTokensWithoutAsset = tokenStore.unknownTokens.filter(
        (token) => !denoms.includes(token.denom)
      )

      tokenStore.$patch({
        tokens: [...tokenStore.tokens, ...tokensList],
        unknownTokens: unknownTokensWithoutAsset
      })
    },

    getTradeableTokensPriceMap() {
      const tokenStore = useTokenStore()

      tokenStore.fetchTokensUsdPriceMap(
        tokenStore.tradeableTokens.map((token) => token.coinGeckoId)
      )
    }
  }
})
