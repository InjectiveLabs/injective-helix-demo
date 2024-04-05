import {
  PerpetualMarket,
  DerivativeMarket,
  ExpiryFuturesMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import { BaseCacheApi, NUXT_CACHE_BASE_URL } from './BaseCacheApi'
import {
  indexerDerivativesApi,
  indexerRestDerivativesChronosApi
} from '~/app/Services'
import { IS_MAINNET } from '@/app/utils/constants'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(props?: { marketStatus?: string }) {
    const fetchFromExchange = async () => {
      const markets = (await indexerDerivativesApi.fetchMarkets({
        marketStatus: props?.marketStatus
      })) as Array<PerpetualMarket | ExpiryFuturesMarket>

      return markets
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<DerivativeMarket[]>(
        '/derivatives/markets',
        { params: { marketStatus: props?.marketStatus } }
      )

      return response.data
    } catch (e) {
      return fetchFromExchange()
    }
  }

  async fetchMarketsSummary() {
    const fetchFromExchange = async () => {
      const response =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<
        AllChronosDerivativeMarketSummary[]
      >('/derivatives/summary')

      return response.data
    } catch (e) {
      return fetchFromExchange()
    }
  }
}

export const derivativeCacheApi = new DerivativeCacheApi(NUXT_CACHE_BASE_URL)
