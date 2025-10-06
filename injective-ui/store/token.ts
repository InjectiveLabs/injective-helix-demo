import { defineStore } from 'pinia'
import {
  tokenCacheApi,
  tokenPriceService,
  sharedTokenClient,
  tokenStaticFactory,
  sharedTokenClientStatic
} from './../Service'
import type { TokenStatic } from '@injectivelabs/sdk-ts'
import type { SharedTokenUsdPriceMap } from './../types'

type SharedTokenStoreState = {
  unknownTokens: TokenStatic[]
  supplyMap: Record<string, string>
  tokenUsdPriceMap: SharedTokenUsdPriceMap
}

const initialStateFactory = (): SharedTokenStoreState => ({
  supplyMap: {},
  unknownTokens: [],
  tokenUsdPriceMap: {}
})

export const useSharedTokenStore = defineStore('sharedToken', {
  state: (): SharedTokenStoreState => initialStateFactory(),
  getters: {
    tokenByDenomOrSymbol:
      (state) =>
      (denomOrSymbol: string): undefined | TokenStatic => {
        if (!denomOrSymbol || denomOrSymbol?.trim() === '') {
          return
        }

        return (
          tokenStaticFactory.toToken(denomOrSymbol) ||
          state.unknownTokens.find(
            (token) => token.denom.toLowerCase() === denomOrSymbol.toLowerCase()
          )
        )
      },

    tokenUsdPriceByCoinGeckoId: (state) => (coinGeckoId: string) => {
      return state.tokenUsdPriceMap[coinGeckoId.toLowerCase()] || 0
    },

    tokenUsdPrice: (state) => (token?: TokenStatic) => {
      if (!token) {
        return 0
      }

      return (
        state.tokenUsdPriceMap[token.coinGeckoId.toLowerCase()] ||
        state.tokenUsdPriceMap[token.denom] ||
        state.tokenUsdPriceMap[token.denom.toLowerCase()] ||
        0
      )
    },

    verifiedTokens: (_): TokenStatic[] => {
      return Object.values(tokenStaticFactory.denomVerifiedMap)
    },

    supplyTokensWithMetadata: (state) => {
      return Object.entries(state.supplyMap).reduce((list, [denom, _]) => {
        const token = tokenStaticFactory.toToken(denom)

        if (!token) {
          return list
        }

        list.push(token)

        return list
      }, [] as TokenStatic[])
    },

    tradableDenomTokenMap: (_) => {
      const sharedSpotStore = useSharedSpotStore()

      return sharedSpotStore.marketsWithToken.reduce(
        (denomTokenMap, market) => {
          if (!market.isVerified) {
            return denomTokenMap
          }

          return {
            ...denomTokenMap,
            [market.baseDenom]: market.baseToken,
            [market.quoteDenom]: market.quoteToken
          }
        },
        {} as Record<string, TokenStatic>
      )
    }
  },
  actions: {
    async fetchSupply() {
      const sharedTokenStore = useSharedTokenStore()

      const { supply } = await tokenCacheApi.fetchTotalSupply()

      const unKnownDenoms: string[] = []
      const supplyMap = supply.reduce(
        (list, coin) => {
          const token = tokenStaticFactory.toToken(coin.denom)

          if (!token) {
            unKnownDenoms.push(coin.denom)
          }

          list[coin.denom] = coin.amount

          return list
        },
        {} as Record<string, string>
      )

      const unknownTokens = unKnownDenoms.map((denom) => {
        return sharedTokenClientStatic.formatToken(denom)
      })

      sharedTokenStore.unknownTokens = [
        ...sharedTokenStore.unknownTokens,
        ...unknownTokens
      ]
      sharedTokenStore.supplyMap = supplyMap
    },

    async fetchTokensUsdPriceMap() {
      const sharedTokenStore = useSharedTokenStore()

      const tokenUsdPriceMap = await tokenPriceService.fetchUsdTokensPrice()

      sharedTokenStore.tokenUsdPriceMap = tokenUsdPriceMap
    },

    /**
     * Used to append unknown token metadata
     * from external/internal API sources
     * for particular set of tokens (account page/single asset page)
     **/
    async appendUnknownTokensList(denoms: string[]) {
      const sharedTokenStore = useSharedTokenStore()

      const denomsTokensNotExist = denoms.filter(
        (denom) =>
          !sharedTokenStore.unknownTokens.find((token) => token.denom === denom)
      )

      const unknownTokens =
        await sharedTokenClient.queryTokens(denomsTokensNotExist)

      sharedTokenStore.$patch({
        unknownTokens: [...sharedTokenStore.unknownTokens, ...unknownTokens]
      })
    }
  }
})
