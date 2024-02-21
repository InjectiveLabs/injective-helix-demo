import { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'
import { BaseCacheApi, NUXT_CACHE_BASE_URL } from './BaseCacheApi'
import { indexerRestSpotChronosApi, indexerSpotApi } from '~/app/Services'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    try {
      const response = await this.client.get<SpotMarket[]>('/spot/markets')

      return response.data
    } catch (e) {
      const response = await indexerSpotApi.fetchMarkets()

      return response
    }
  }

  async fetchMarketsSummary() {
    try {
      const response = await this.client.get<AllChronosSpotMarketSummary[]>(
        '/spot/summary'
      )

      return response.data
    } catch (e) {
      const response = await indexerRestSpotChronosApi.fetchMarketsSummary()

      return response
    }
  }
}

export const spotCacheApi = new SpotCacheApi(NUXT_CACHE_BASE_URL)
