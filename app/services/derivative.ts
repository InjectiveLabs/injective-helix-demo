import { HttpClient } from '@injectivelabs/utils'
import { getNetworkEndpoints } from '@injectivelabs/networks'
import { NETWORK } from '@shared/utils/constant'

const endpoint = getNetworkEndpoints(NETWORK).indexer

const httpClient = new HttpClient(`${endpoint}/api/aggregator/v1/`)

export const fetchDerivativeStats = async () => {
  const { data } = (await httpClient.get('derivative/contracts')) as {
    data: { ticker_id: string; open_interest: number }[]
  }

  return data
}
