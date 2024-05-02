import { defineStore } from 'pinia'
import { TokenStatic } from '@injectivelabs/token-metadata'
import { tokenPrice } from '@shared/Service'
import { tokenFactoryStatic } from '@/app/Services'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  tokens: TokenStatic[]
  unknownTokens: TokenStatic[]
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
    tokenByDenomOrSymbol:
      (_) =>
      (denomOrSymbol: string): TokenStatic | undefined => {
        if (!denomOrSymbol) {
          return
        }

        return tokenFactoryStatic.toToken(denomOrSymbol)
      },

    tokenUsdPriceByCoinGeckoId: (state) => (coinGeckoId: string) => {
      return state.tokenUsdPriceMap[coinGeckoId.toLowerCase()] || 0
    },

    tokenUsdPrice: (state) => (token?: TokenStatic) => {
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

    /**
     * Used to append unknown token metadata
     * from external/internal API sources
     * for particular set of tokens (account page/single asset page)
     **/
    appendUnknownTokensList(tokens: TokenStatic[]) {
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

    async getTokensUsdPriceMapFromToken(tokens: TokenStatic[]) {
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
