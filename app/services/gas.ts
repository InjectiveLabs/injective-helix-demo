import { HttpClient, BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { ChainId } from '@injectivelabs/ts-types'
import { GWEI_IN_WEI, DEFAULT_GAS_PRICE, CHAIN_ID } from '../utils/constants'
import { EthGasStationResult } from '~/types'

export const fetchGasPrice = async (): Promise<string> => {
  const isTestnet = [ChainId.Kovan, ChainId.Injective].includes(CHAIN_ID)

  if (isTestnet) {
    return DEFAULT_GAS_PRICE.toString()
  }

  const client = new HttpClient('https://ethgasstation.info/json')

  try {
    const response = (await client.get(`ethgasAPI.json`)) as {
      data: EthGasStationResult
    }

    if (!response || (response && !response.data)) {
      return DEFAULT_GAS_PRICE.toString()
    }

    return new BigNumberInWei(
      new BigNumber(response.data.average / 10).multipliedBy(GWEI_IN_WEI)
    )
      .toBase()
      .toString()
  } catch (e) {
    return DEFAULT_GAS_PRICE.toString()
  }
}
