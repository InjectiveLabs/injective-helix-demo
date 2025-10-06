import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { getStakingApi, getIndexerRestExplorerApi } from '../../Service'
import type {
  Validator,
  Pagination,
  ExplorerValidator
} from '@injectivelabs/sdk-ts'

export class StakingCacheApi extends BaseCacheApi {
  async fetchValidators(_params?: any) {
    const stakingApi = await getStakingApi()

    const fetchFromSource = async () => {
      const { validators, pagination } = await stakingApi.fetchValidators({
        limit: 500
      })

      return { validators, pagination }
    }

    if (!IS_MAINNET) {
      return fetchFromSource()
    }

    try {
      const response = await this.client.get<{
        pagination: Pagination
        validators: Validator[]
      }>('cache/validators')

      return response.data
    } catch {
      return fetchFromSource()
    }
  }

  async fetchExplorerValidators(_params?: any) {
    const indexerRestExplorerApi = await getIndexerRestExplorerApi()

    const fetchFromSource = async () => {
      const explorerValidators = await indexerRestExplorerApi.fetchValidators()

      return explorerValidators
    }

    if (!IS_MAINNET) {
      return fetchFromSource()
    }

    try {
      const response = await this.client.get<{
        validators: ExplorerValidator[]
      }>('cache/explorer-validators')

      return response.data.validators
    } catch {
      return fetchFromSource()
    }
  }
}
