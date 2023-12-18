import {
  AllChronosDerivativeMarketSummary,
  AllChronosSpotMarketSummary,
  DerivativeMarket,
  Pagination,
  SpotMarket,
  TotalSupply
} from '@injectivelabs/sdk-ts'
import axios, { AxiosInstance } from 'axios'

const BASE_URL = 'http://localhost:3001/api'

export class CacheApi {
  client: AxiosInstance

  constructor(url: string) {
    this.client = axios.create({ baseURL: url })
  }

  async fetchTokens() {
    const response = await this.client.get<{
      supply: TotalSupply
      pagination: Pagination
    }>('/tokens')

    return response.data
  }

  async fetchSpotMarkets() {
    const response = await this.client.get<SpotMarket[]>('/spot/markets')

    return response.data
  }

  async fetchDerivativeMarkets(props?: { marketStatus?: string }) {
    const response = await this.client.get<DerivativeMarket[]>(
      '/derivatives/markets',
      { params: { marketStatus: props?.marketStatus } }
    )
    return response.data
  }

  async fetchSpotMarketSummary() {
    const response = await this.client.get<AllChronosSpotMarketSummary[]>(
      '/spot/summary'
    )

    return response.data
  }

  async fetchDerivativeMarketSummary() {
    const response = await this.client.get<AllChronosDerivativeMarketSummary[]>(
      '/derivatives/summary'
    )

    return response.data
  }
}

export const cacheApi = new CacheApi(BASE_URL)
