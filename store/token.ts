import { defineStore } from 'pinia'
import { TokenType, type Token } from '@injectivelabs/token-metadata'
import { awaitForAll } from '@injectivelabs/utils'
import { denomClient, tokenPrice } from '@/app/Services'
import { baseCacheApi } from '@/app/providers/cache/BaseCacheApi'
import { TokenUsdPriceMap } from '@/types'

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
    tokenUsdPriceByCoinGeckoId: (state) => (coinGeckoId: string) => {
      return state.tokenUsdPriceMap[coinGeckoId.toLowerCase()] || 0
    },

    tokenUsdPrice: (state) => (token?: Token) => {
      if (!token) {
        return 0
      }

      return (
        state.tokenUsdPriceMap[token.coinGeckoId] ||
        state.tokenUsdPriceMap[token.denom.toLowerCase()] ||
        0
      )
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

    async fetchTokens() {
      const tokenStore = useTokenStore()

      if (tokenStore.tokens.length > 0) {
        return
      }

      const { supply } = await baseCacheApi.fetchTotalSupply()

      const supplyWithTokensOrUnknown = supply.map((coin) =>
        denomClient.getDenomTokenStaticOrUnknown(coin.denom)
      ) as Token[]

      const supplyWithToken = supplyWithTokensOrUnknown.filter(
        (token) => token.tokenType !== TokenType.Unknown
      )

      const supplyWithUnknownTokens = supplyWithTokensOrUnknown.filter(
        (token) => token.tokenType === TokenType.Unknown
      )

      tokenStore.$patch({
        tokens: supplyWithToken,
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

    /**
     * Used to append unknown token metadata
     * from external/internal API sources
     * for particular set of tokens (account page/single asset page)
     **/
    appendUnknownTokensList(tokens: Token[]) {
      const tokenStore = useTokenStore()

      const tokenDenoms = tokens.map((t) => t.denom)
      const unknownTokens = tokenStore.unknownTokens.filter((asset) =>
        tokenDenoms.includes(asset.denom)
      )

      if (!unknownTokens.length) {
        return
      }

      const unknownTokensWithoutAsset = tokenStore.unknownTokens.filter(
        (token) => !tokenDenoms.includes(token.denom)
      )

      tokenStore.$patch({
        tokens: [...tokenStore.tokens, ...tokens],
        unknownTokens: unknownTokensWithoutAsset
      })
    },

    async getTokensUsdPriceMapFromToken(tokens: Token[]) {
      const tokenStore = useTokenStore()

      if (tokens.length === 0) {
        return
      }

      const tokensWithoutCoinGeckoId = tokens
        .filter((token) => !token.coinGeckoId)
        .map((token) => token.denom.toLowerCase())
      const tokensWithCoinGeckoId = tokens
        .filter((token) => token.coinGeckoId)
        .map((token) => token.coinGeckoId)

      const tokenUsdPriceMapFromCoinGeckoId =
        await tokenPrice.fetchUsdTokensPrice([
          ...new Set(tokensWithCoinGeckoId.filter((id) => id))
        ])
      const tokenUsdPriceMapFromDenoms = await tokenPrice.fetchUsdDenomsPrice([
        ...new Set(tokensWithoutCoinGeckoId.filter((denom) => denom))
      ])

      tokenStore.tokenUsdPriceMap = {
        ...tokenUsdPriceMapFromCoinGeckoId,
        ...tokenUsdPriceMapFromDenoms,
        ...tokenStore.tokenUsdPriceMap
      }
    },

    getTradeableTokensPriceMap() {
      const tokenStore = useTokenStore()

      tokenStore.fetchTokensUsdPriceMap(
        tokenStore.tradeableTokens.map((token) => token.coinGeckoId)
      )
    }
  }
})
