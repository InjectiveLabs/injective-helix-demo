import { HttpClient, BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { ChainId } from '@injectivelabs/ts-types'
import { IS_TESTNET, GWEI_IN_WEI, DEFAULT_GAS_PRICE, CHAIN_ID } from '../utils/constants'
import { EthGasStationResult } from '~/types'

export const fetchGasPrice = async (): Promise<string> => {
  if (IS_TESTNET || CHAIN_ID === ChainId.Kovan) {
    return new BigNumberInWei(DEFAULT_GAS_PRICE).toString()
  }

  try {
    const response = (await new HttpClient(
      'https://ethgasstation.info/json'
    ).get(`ethgasAPI.json`)) as {
      data: EthGasStationResult
    }

    if (!response || (response && !response.data)) {
      return new BigNumberInWei(DEFAULT_GAS_PRICE).toString()
    }

    return new BigNumberInWei(
      new BigNumber(response.data.fast / 10).multipliedBy(GWEI_IN_WEI)
    ).toString()
  } catch (e) {
    return DEFAULT_GAS_PRICE.toString()
  }
}
