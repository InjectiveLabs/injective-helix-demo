import { defineStore } from 'pinia'
import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import { tokenCacheApi, tokenPriceService } from '@shared/Service'
import { tokens } from '@/app/json'
import { getToken } from '@/app/utils/helpers'
import { tokenFactoryStatic } from '@/app/Services'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  unknownTokens: TokenStatic[]
  tokenUsdPriceMap: TokenUsdPriceMap
}

const initialStateFactory = (): TokenStoreState => ({
  unknownTokens: [],
  tokenUsdPriceMap: {}
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tokenBySymbol:
      (_) =>
      (symbol: string): TokenStatic | undefined => {
        return (
          tokenFactoryStatic.getMetaBySymbol(symbol, {
            type: TokenType.Symbol
          }) ||
          tokenFactoryStatic.getMetaBySymbol(symbol, {
            verification: TokenVerification.Verified
          })
        )
      },

    tokenByDenomOrSymbol:
      (state) =>
      (denomOrSymbol: string): TokenStatic | undefined => {
        if (!denomOrSymbol) {
          return
        }

        return (
          tokenFactoryStatic.toToken(denomOrSymbol) ||
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
        .map((denom) => tokenFactoryStatic.toToken(denom))
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
        .map((denom) => tokenFactoryStatic.toToken(denom))
        .filter((token) => token) as TokenStatic[]
    },

    verifiedTokens: (_): TokenStatic[] => {
      return tokens.filter(
        (token) =>
          (token.tokenVerification as TokenVerification) ===
          TokenVerification.Verified
      ) as TokenStatic[]
    }
  },
  actions: {
    async fetchUntrackedTokens() {
      const tokenStore = useTokenStore()

      const { supply } = await tokenCacheApi.fetchTotalSupply()

      const denomsWithoutTokens = supply
        .filter((coin) => !tokenStore.tokenByDenomOrSymbol(coin.denom))
        .map((coin) => coin.denom)

      const denomTokensToFetch = denomsWithoutTokens.filter(
        (denom) =>
          !tokenStore.unknownTokens.find((token) => token.denom === denom)
      )

      let unknownTokens: TokenStatic[] = []

      for (const denom of denomTokensToFetch) {
        const token = await getToken(denom)

        if (!token) {
          continue
        }

        unknownTokens = [...unknownTokens, token]
      }

      tokenStore.$patch({
        unknownTokens: [...tokenStore.unknownTokens, ...unknownTokens]
      })
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
      const tokens = await Promise.all(
        denomsTokensNotExist.map(async (denom) => await getToken(denom))
      )

      tokenStore.$patch({
        unknownTokens: [
          ...tokenStore.unknownTokens,
          ...tokens.filter((token) => token)
        ]
      })
    }
  }
})
