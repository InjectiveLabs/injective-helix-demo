import { defineStore } from 'pinia'
import { MARKET_IDS_TO_HIDE } from './../data/market'
import {
  toUiMarketSummary,
  toUiDerivativeMarket,
  toZeroUiMarketSummary,
  sharedGetDerivativeSlugOverride
} from './../transformer/market'
import { SharedMarketStatus } from './../types'
import { derivativeCacheApi } from './../Service'
import type { PerpetualMarket } from '@injectivelabs/sdk-ts'
import type { SharedUiMarketSummary, SharedUiDerivativeMarket } from '../types'

type derivativeStore = {
  markets: PerpetualMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

const transformMarket = (
  market: PerpetualMarket
): undefined | SharedUiDerivativeMarket => {
  const tokenStore = useSharedTokenStore()

  const slug = sharedGetDerivativeSlugOverride({
    ticker: market.ticker,
    marketId: market.marketId
  })

  const baseTokenSymbol = slug.endsWith('-usdt-perp') ? slug.replace('-usdt-perp', '') : slug.split('-')[0]

  const baseToken = tokenStore.tokenByDenomOrSymbol(
    baseTokenSymbol.toUpperCase()
  )
  const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

  if (!baseToken || !quoteToken) {
    return undefined
  }

  return toUiDerivativeMarket({
    slug,
    market,
    baseToken,
    quoteToken
  })
}

export const useSharedDerivativeStore = defineStore('sharedDerivative', {
  state: (): derivativeStore => ({
    markets: [] as PerpetualMarket[],
    marketsSummary: []
  }),

  getters: {
    allMarketsWithToken: (state): SharedUiDerivativeMarket[] => {
      const jsonStore = useSharedJsonStore()

      const uiMarkets = state.markets.map((market) => {
        const formattedMarket = transformMarket(market)

        if (!formattedMarket) {
          return undefined
        }

        return {
          ...formattedMarket,
          isVerified: [
            ...jsonStore.expiryMarketIds,
            ...jsonStore.verifiedDerivativeMarketIds
          ].includes(market.marketId)
        }
      })

      return uiMarkets.filter(
        (market) => market && !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ) as SharedUiDerivativeMarket[]
    },

    marketsWithToken: (state): SharedUiDerivativeMarket[] => {
      const jsonStore = useSharedJsonStore()

      const uiMarkets = state.markets.map((market) => {
        const formattedMarket = transformMarket(market)

        if (!formattedMarket) {
          return undefined
        }

        return {
          ...formattedMarket,
          isVerified: [
            ...jsonStore.expiryMarketIds,
            ...jsonStore.verifiedDerivativeMarketIds
          ].includes(market.marketId)
        }
      })

      return uiMarkets.filter(
        (market) =>
          market &&
          !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ) as SharedUiDerivativeMarket[]
    }
  },

  actions: {
    async fetchMarkets() {
      const derivativeStore = useSharedDerivativeStore()

      const markets =
        (await derivativeCacheApi.fetchMarkets()) as PerpetualMarket[]

      derivativeStore.markets = markets
    },

    async fetchAllMarkets() {
      const derivativeStore = useSharedDerivativeStore()

      const markets = (await derivativeCacheApi.fetchMarkets([
        SharedMarketStatus.Active,
        SharedMarketStatus.Paused,
        SharedMarketStatus.Expired,
        SharedMarketStatus.Expired,
        SharedMarketStatus.Suspended,
        SharedMarketStatus.Demolished
      ])) as PerpetualMarket[]

      derivativeStore.markets = markets
    },

    async fetchMarketsSummary() {
      const derivativeStore = useSharedDerivativeStore()

      const marketSummaries = await derivativeCacheApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = derivativeStore.markets.filter(
        ({ marketId }) =>
          !marketSummaries.some(({ marketId: id }) => id === marketId)
      )

      derivativeStore.$patch({
        marketsSummary: [
          ...marketSummaries.map(toUiMarketSummary),
          ...marketsWithoutMarketSummaries.map(({ marketId }) =>
            toZeroUiMarketSummary(marketId)
          )
        ]
      })
    }
  }
})
