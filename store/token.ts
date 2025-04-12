import { defineStore } from 'pinia'
import {
  tokenCacheApi,
  tokenPriceService,
  sharedTokenClient,
  tokenStaticFactory
} from '@shared/Service'
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  unknownTokens: TokenStatic[]
  supplyMap: Record<string, string>
  tokenUsdPriceMap: TokenUsdPriceMap
}

const initialStateFactory = (): TokenStoreState => ({
  supplyMap: {},
  unknownTokens: [],
  tokenUsdPriceMap: {}
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tokenByDenomOrSymbol:
      (state) =>
      (denomOrSymbol: string): TokenStatic | undefined => {
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

    unverifiedTokens: (_): TokenStatic[] => {
      const spotStore = useSpotStore()
      const derivativeStore = useDerivativeStore()

      const denoms = [
        ...new Set([
          ...spotStore.unverifiedDenoms,
          ...derivativeStore.unverifiedDenoms
        ])
      ]

      return denoms
        .map((denom) => tokenStaticFactory.toToken(denom))
        .filter((token) => token) as TokenStatic[]
    },

    tradeableTokens: (_): TokenStatic[] => {
      const spotStore = useSpotStore()
      const derivativeStore = useDerivativeStore()

      const denoms = [
        ...new Set([
          ...spotStore.tradeableDenoms,
          ...derivativeStore.tradeableDenoms
        ])
      ]

      return denoms
        .map((denom) => tokenStaticFactory.toToken(denom))
        .filter((token) => token) as TokenStatic[]
    },

    verifiedTokens: (_): TokenStatic[] => {
      return Object.values(tokenStaticFactory.denomVerifiedMap)
    }
  },
  actions: {
    async fetchSupply() {
      const tokenStore = useTokenStore()

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

      tokenStore.supplyMap = supplyMap
    },

    async fetchTokensUsdPriceMap(coinGeckoIdList: string[] = []) {
      const tokenStore = useTokenStore()

      const tokenUsdPriceMap = await tokenPriceService.fetchUsdTokensPrice(
        coinGeckoIdList
      )

      tokenStore.tokenUsdPriceMap = tokenUsdPriceMap
    },

    /**
     * Used to append unknown token metadata
     * from external/internal API sources
     * for particular set of tokens (account page/single asset page)
     **/
    async appendUnknownTokensList(denoms: string[]) {
      const tokenStore = useTokenStore()

      const denomsTokensNotExist = denoms.filter(
        (denom) =>
          !tokenStore.unknownTokens.find((token) => token.denom === denom)
      )

      const unknownTokens = await sharedTokenClient.queryTokens(
        denomsTokensNotExist
      )

      tokenStore.$patch({
        unknownTokens: [...tokenStore.unknownTokens, ...unknownTokens]
      })
    }
  }
})
