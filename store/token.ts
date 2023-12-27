import { defineStore } from 'pinia'
import { TokenType, type Token } from '@injectivelabs/token-metadata'
import { awaitForAll } from '@injectivelabs/utils'
import { bankApi, denomClient, tokenPrice } from '@/app/Services'
import { IS_MAINNET } from '@/app/utils/constants/setup'
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

    async fetchTokens() {
      const tokenStore = useTokenStore()
      const apiClient = IS_MAINNET ? baseCacheApi : bankApi

      if (tokenStore.tokens.length > 0) {
        return
      }

      const { supply } = await apiClient.fetchTotalSupply({ limit: 1000 })

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
