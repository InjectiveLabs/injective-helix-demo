import { HttpClient } from '@injectivelabs/utils'
import { ENDPOINTS } from '@shared/utils/constant'

export const fetchDerivativeStats = async () => {
  const httpClient = new HttpClient(`${ENDPOINTS.indexer}/api/aggregator/v1/`)

  const { data } = (await httpClient.get('derivative/contracts')) as {
    data: { ticker_id: string; open_interest: number }[]
  }

  return data
}
