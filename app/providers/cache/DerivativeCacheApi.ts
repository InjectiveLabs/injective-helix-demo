import {
  DerivativeMarket,
  AllChronosDerivativeMarketSummary,
  PerpetualMarket,
  ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import { BaseCacheApi, NUXT_CACHE_BASE_URL } from './BaseCacheApi'
import {
  indexerDerivativesApi,
  indexerRestDerivativesChronosApi
} from '~/app/Services'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(props?: { marketStatus?: string }) {
    try {
      const response = await this.client.get<DerivativeMarket[]>(
        '/derivatives/markets',
        { params: { marketStatus: props?.marketStatus } }
      )

      return response.data
    } catch (e) {
      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >

      return markets
    }
  }

  async fetchMarketsSummary() {
    try {
      const response = await this.client.get<
        AllChronosDerivativeMarketSummary[]
      >('/derivatives/summary')

      return response.data
    } catch (e) {
      const response =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()

      return response
    }
  }
}

export const derivativeCacheApi = new DerivativeCacheApi(NUXT_CACHE_BASE_URL)
