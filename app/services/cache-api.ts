import {
  DerivativeMarket,
  Pagination,
  SpotMarket,
  TotalSupply
} from '@injectivelabs/sdk-ts'
import axios from 'axios'

const BASE_URL = 'http://localhost:3001/api'

export class CacheApi {
  client: AxiosInstance

  constructor(url: string) {
    this.client = axios.create({ baseUrl: BASE_URL })
  }

  async fetchTokens() {
    const response = (await this.httpClient.get('/tokens')) as any

    return response.data as {
      supply: TotalSupply
      pagination: Pagination
    }
  }

  async fetchSpotMarkets() {
    const response = (await this.httpClient.get<undefined, SpotMarket[]>(
      '/spot/markets'
    )) as any

    return response.data as SpotMarket[]
  }

  async fetchDerivativeMarkets({ marketStatus: string }) {
    const response = (await this.httpClient.get('/derivatives/markets')) as any
    return response.data as DerivativeMarket[]
  }
}

export const cacheApi = new CacheApi(BASE_URL)
