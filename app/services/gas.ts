import { HttpClient, BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { GWEI_IN_WEI, TESTNET_GAS_PRICE } from '../utils/constants'
import { EthGasStationResult } from '~/types'

export const fetchGasPrice = async (): Promise<string> => {
  const client = new HttpClient('https://ethgasstation.info/json')
  const response = (await client.get(`ethgasAPI.json`)) as {
    data: EthGasStationResult
  }

  if (!response || (response && !response.data)) {
    return TESTNET_GAS_PRICE.toString()
  }

  return new BigNumberInWei(
    new BigNumber(response.data.average / 10).multipliedBy(GWEI_IN_WEI)
  ).toString()
}
