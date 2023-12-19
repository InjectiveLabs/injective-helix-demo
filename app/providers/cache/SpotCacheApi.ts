import { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'
import { BaseCacheApi, NUXT_CACHE_BASE_URL } from './BaseCacheApi'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    const response = await this.client.get<SpotMarket[]>('/spot/markets')

    return response.data
  }

  async fetchMarketsSummary() {
    const response = await this.client.get<AllChronosSpotMarketSummary[]>(
      '/spot/summary'
    )

    return response.data
  }
}

export const spotCacheApi = new SpotCacheApi(NUXT_CACHE_BASE_URL)
