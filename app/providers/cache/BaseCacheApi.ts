import { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'
import axios, { AxiosInstance } from 'axios'
import { bankApi } from '../../Services'
import { IS_MAINNET } from '@/app/utils/constants'

export const NUXT_CACHE_BASE_URL = 'https://injective-nuxt-api.vercel.app/api'

export class BaseCacheApi {
  client: AxiosInstance

  constructor(url: string) {
    this.client = axios.create({ baseURL: url, timeout: 15000 })
  }

  async fetchTotalSupply() {
    const fetchFromBank = async () => {
      const { supply, pagination } = await bankApi.fetchTotalSupply({
        limit: 2000
      })

      return { supply, pagination }
    }

    if (!IS_MAINNET) {
      return fetchFromBank()
    }

    try {
      const response = await this.client.get<{
        supply: TotalSupply
        pagination: Pagination
      }>('/tokens')

      return response.data
    } catch (e) {
      return fetchFromBank()
    }
  }
}

export const baseCacheApi = new BaseCacheApi(NUXT_CACHE_BASE_URL)
