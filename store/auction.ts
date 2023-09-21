import { defineStore } from 'pinia'
import {
  UiSpotMarketWithToken,
  UiSpotTransformer
} from '@injectivelabs/sdk-ui-ts'
import { indexerSpotApi, tokenService } from '~/app/Services'
import { AUCTION_MARKET_IDS } from '~/app/data/market'

type AuctionStoreState = {
  markets: UiSpotMarketWithToken[]
}

const initialStateFactory = (): AuctionStoreState => ({
  markets: []
})

export const useAuctionStore = defineStore('auction', {
  state: (): AuctionStoreState => initialStateFactory(),
  actions: {
    async fetchMarkets() {
      const auctionStore = useAuctionStore()

      const markets = await indexerSpotApi.fetchMarkets()

      const marketsWithToken = await tokenService.toSpotMarketsWithToken(
        markets
      )

      const uiMarkets =
        UiSpotTransformer.spotMarketsToUiSpotMarkets(marketsWithToken)

      const uiMarketsWithToken = uiMarkets.filter((market) =>
        AUCTION_MARKET_IDS.includes(market.marketId)
      )

      auctionStore.$patch({
        markets: uiMarketsWithToken
      })
    }
  }
})
