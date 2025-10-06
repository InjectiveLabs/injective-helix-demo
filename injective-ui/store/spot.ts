import { defineStore } from 'pinia'
import { MARKET_IDS_TO_HIDE } from './../data/market'
import {
  toUiSpotMarket,
  toUiMarketSummary,
  toZeroUiMarketSummary
} from './../transformer/market'
import { spotCacheApi } from './../Service'
import { SharedMarketStatus } from './../types'
import type { SpotMarket } from '@injectivelabs/sdk-ts'
import type { SharedUiSpotMarket, SharedUiMarketSummary } from './../types'

export type SpotStoreState = {
  markets: SpotMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

const transformMarket = (
  market: SpotMarket
): undefined | SharedUiSpotMarket => {
  const tokenStore = useSharedTokenStore()

  const baseToken = tokenStore.tokenByDenomOrSymbol(market.baseDenom)
  const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

  if (!baseToken || !quoteToken) {
    return undefined
  }

  return toUiSpotMarket({
    market,
    baseToken,
    quoteToken
  })
}

export const useSharedSpotStore = defineStore('sharedSpot', {
  state: (): SpotStoreState => ({
    markets: [] as SpotMarket[],
    marketsSummary: []
  }),

  getters: {
    allMarketsWithToken: (state): SharedUiSpotMarket[] => {
      const jsonStore = useSharedJsonStore()

      const uiMarkets = state.markets.map((market) => {
        const formattedMarket = transformMarket(market)

        if (!formattedMarket) {
          return undefined
        }

        return {
          ...formattedMarket,
          isVerified: jsonStore.verifiedSpotMarketIds.includes(market.marketId)
        } as SharedUiSpotMarket
      })

      return uiMarkets.filter(
        (market) => market && !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ) as SharedUiSpotMarket[]
    },

    marketsWithToken: (state): SharedUiSpotMarket[] => {
      const jsonStore = useSharedJsonStore()

      const uiMarkets = state.markets.map((market) => {
        const formattedMarket = transformMarket(market)

        if (!formattedMarket) {
          return undefined
        }

        return {
          ...formattedMarket,
          isVerified: jsonStore.verifiedSpotMarketIds.includes(market.marketId)
        } as SharedUiSpotMarket
      })

      return uiMarkets.filter(
        (market) =>
          market &&
          !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ) as SharedUiSpotMarket[]
    }
  },

  actions: {
    async fetchMarkets() {
      const spotStore = useSharedSpotStore()

      const markets = await spotCacheApi.fetchMarkets()

      spotStore.markets = markets
    },

    async fetchAllMarkets() {
      const spotStore = useSharedSpotStore()

      const markets = await spotCacheApi.fetchMarkets([
        SharedMarketStatus.Active,
        SharedMarketStatus.Paused,
        SharedMarketStatus.Expired,
        SharedMarketStatus.Expired,
        SharedMarketStatus.Suspended,
        SharedMarketStatus.Demolished
      ])

      spotStore.markets = markets
    },

    async fetchMarketsSummary() {
      const spotStore = useSharedSpotStore()

      const marketsSummaries = (await spotCacheApi.fetchMarketsSummary()) || []

      const marketsWithoutMarketSummaries = spotStore.markets.filter(
        ({ marketId }) =>
          !marketsSummaries.some(({ marketId: id }) => id === marketId)
      )

      spotStore.marketsSummary = [
        ...marketsSummaries.map(toUiMarketSummary),
        ...marketsWithoutMarketSummaries.map(({ marketId }) =>
          toZeroUiMarketSummary(marketId)
        )
      ]
    }
  }
})
