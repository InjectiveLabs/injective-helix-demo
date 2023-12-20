import {
  DerivativeMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import { BaseCacheApi, NUXT_CACHE_BASE_URL } from './BaseCacheApi'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(props?: { marketStatus?: string }) {
    const response = await this.client.get<DerivativeMarket[]>(
      '/derivatives/markets',
      { params: { marketStatus: props?.marketStatus } }
    )
    return response.data
  }

  async fetchMarketsSummary() {
    const response = await this.client.get<AllChronosDerivativeMarketSummary[]>(
      '/derivatives/summary'
    )

    return response.data
  }
}

export const derivativeCacheApi = new DerivativeCacheApi(NUXT_CACHE_BASE_URL)
