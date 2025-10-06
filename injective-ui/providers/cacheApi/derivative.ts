import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import {
  getIndexerDerivativesApi,
  getIndexerRestDerivativeChronosApi
} from '../../Service'
import type {
  PerpetualMarket,
  DerivativeMarket,
  ExpiryFuturesMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import type { SharedMarketStatus } from '../../types'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(marketStatuses?: SharedMarketStatus[]) {
    const indexerDerivativesApi = await getIndexerDerivativesApi()

    const fetchFromExchange = async () => {
      const markets = (await indexerDerivativesApi.fetchMarkets(
        marketStatuses ? { marketStatuses } : undefined
      )) as Array<PerpetualMarket | ExpiryFuturesMarket>

      return markets
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<DerivativeMarket[]>(
        'cache/derivatives/markets',
        marketStatuses ? { params: { marketStatuses } } : undefined
      )

      return response.data
    } catch {
      return fetchFromExchange()
    }
  }

  async fetchMarketsSummary() {
    const indexerRestDerivativeChronosApi =
      await getIndexerRestDerivativeChronosApi()

    const fetchFromExchange = async () => {
      const response =
        await indexerRestDerivativeChronosApi.fetchMarketsSummary()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<
        AllChronosDerivativeMarketSummary[]
      >('cache/derivatives/summary')

      return response.data
    } catch {
      return fetchFromExchange()
    }
  }
}
