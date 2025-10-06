import { HttpRestClient } from '@injectivelabs/utils'
import { HttpRequestException } from '@injectivelabs/exceptions'
import type {
  CoinGeckoCoin,
  CoinGeckoReturnObject,
  CoinGeckoCoinResponse,
  CoinGeckoMarketChartResponse
} from '../../types'

export class CoinGeckoApiService {
  private httpClient: HttpRestClient

  private apiKey: string

  constructor({ apiKey, baseUrl }: { apiKey: string; baseUrl: string }) {
    const headers = {
      'Content-Type': 'application/json'
    } as any

    if (apiKey) {
      headers['X-Cg-Pro-Api-Key'] = apiKey
    }

    this.apiKey = apiKey
    this.httpClient = new HttpRestClient(baseUrl, { timeout: 1500 }).setConfig({
      headers
    })
  }

  async fetchUsdPrice(
    coinId: string,
    options: undefined | Record<string, any> = {}
  ) {
    try {
      const actualParams = {
        localization: false,
        community_data: false,
        tickers: false,
        sparkline: false,
        developer_data: false,
        x_cg_pro_api_key: this.apiKey,
        ...options
      }

      const { data } = (await this.httpClient.get(
        `/coins/${coinId}`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoinResponse>

      return data?.market_data?.current_price?.usd
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchPrice(
    coinId: string,
    options: undefined | Record<string, any> = {}
  ) {
    try {
      const actualParams = {
        localization: false,
        community_data: false,
        tickers: false,
        sparkline: false,
        developer_data: false,
        x_cg_pro_api_key: this.apiKey,
        ...options
      }

      const { data } = (await this.httpClient.get(
        `/coins/${coinId}`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoinResponse>

      return data?.market_data?.current_price
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchCoin(
    coinId: string,
    options: undefined | Record<string, any> = {}
  ) {
    try {
      const actualParams = {
        localization: false,
        community_data: false,
        tickers: false,
        sparkline: false,
        developer_data: false,
        x_cg_pro_api_key: this.apiKey,
        ...options
      }

      const { data } = (await this.httpClient.get(
        `/coins/${coinId}`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoinResponse>

      return data
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchErc20TokenCoinId(
    tokenAddress: string,
    options: undefined | Record<string, any> = {}
  ) {
    try {
      const actualParams = {
        x_cg_pro_api_key: this.apiKey,
        ...options
      }

      const { data } = (await this.httpClient.get(
        `/coins/ethereum/contract/${tokenAddress}`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoinResponse>

      return data?.id
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchChart(id: string, params: undefined | Record<string, any> = {}) {
    try {
      const actualParams = {
        ...params,
        x_cg_pro_api_key: this.apiKey
      }

      const { data } = (await this.httpClient.get(
        `/coins/${id}/market_chart/range`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoMarketChartResponse>

      return data
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchHistory(id: string, params: undefined | Record<string, any> = {}) {
    try {
      const actualParams = {
        ...params,
        x_cg_pro_api_key: this.apiKey
      }

      const { data } = (await this.httpClient.get(
        `/coins/${id}/history`,
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoinResponse>

      return data
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }

  async fetchCoins(params: undefined | Record<string, any> = {}) {
    try {
      const actualParams = {
        include_platform: false,
        x_cg_pro_api_key: this.apiKey,
        ...params
      }

      return (await this.httpClient.get(
        '/coins/list',
        actualParams
      )) as CoinGeckoReturnObject<CoinGeckoCoin[]>
    } catch (e: unknown) {
      if (e instanceof HttpRequestException) {
        throw e
      }

      throw new HttpRequestException(new Error(e as any))
    }
  }
}
