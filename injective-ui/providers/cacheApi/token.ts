import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { getBankApi } from '../../Service'
import type { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'

export class TokenCacheApi extends BaseCacheApi {
  async fetchTotalSupply() {
    const bankApi = await getBankApi()

    const fetchFromBank = async () => {
      const { supply, pagination } = await bankApi.fetchAllTotalSupply({
        limit: 5000
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
      }>('cache/tokens')

      return response.data
    } catch {
      return fetchFromBank()
    }
  }
}
