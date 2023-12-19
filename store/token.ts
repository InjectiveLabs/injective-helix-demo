import { defineStore } from 'pinia'
import { TokenType, type Token } from '@injectivelabs/token-metadata'
import { awaitForAll } from '@injectivelabs/utils'
import { bankApi, denomClient, tokenPrice } from '@/app/Services'
import { IS_STAGING } from '@/app/utils/constants/setup'
import { baseCacheApi } from '@/app/providers/cache/BaseCacheApi'
import { TokenUsdPriceMap } from '@/types'
import { MARKET_IDS_WITHOUT_COINGECKO_ID } from '@/app/data/market'

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
      const apiClient = IS_STAGING ? baseCacheApi : bankApi

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

      const supplyWithTokenWithInjTokens = supplyWithToken.map((token) => {
        const marketData = MARKET_IDS_WITHOUT_COINGECKO_ID.find(
          (market) => market.symbol === token.symbol
        )

        if (marketData) {
          return { ...token, coinGeckoId: marketData.coingeckoId }
        } else {
          return token
        }
      })

      const supplyWithUnknownTokens = supplyWithTokensOrUnknown.filter(
        (token) => token.tokenType === TokenType.Unknown
      )

      tokenStore.$patch({
        tokens: supplyWithTokenWithInjTokens,
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
