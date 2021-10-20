import { HttpClient, BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { ChainId } from '@injectivelabs/ts-types'
import {
  IS_TESTNET,
  GWEI_IN_WEI,
  DEFAULT_GAS_PRICE,
  CHAIN_ID
} from '../utils/constants'
import { EtherchainResult, EthGasStationResult } from '~/types/gas'

export const fetchGasPriceFromEtherchain = async (): Promise<string> => {
  try {
    const response = (await new HttpClient(
      'https://www.etherchain.org/api/'
    ).get('gasPriceOracle')) as {
      data: EtherchainResult
    }

    if (!response || (response && !response.data)) {
      throw new Error('No response from Etherchain')
    }

    return new BigNumberInWei(
      new BigNumber(response.data.fast * 10).multipliedBy(GWEI_IN_WEI)
    ).toString()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const fetchGasPriceFromEthGasStation = async (): Promise<string> => {
  try {
    const response = (await new HttpClient(
      'https://ethgasstation.info/json'
    ).get('ethgasAPI.json')) as {
      data: EthGasStationResult
    }

    if (!response || (response && !response.data)) {
      throw new Error('No response from Ethgasstation')
    }

    return new BigNumberInWei(
      new BigNumber(response.data.fast / 10).multipliedBy(GWEI_IN_WEI)
    ).toString()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const fetchGasPrice = async (): Promise<string> => {
  if (IS_TESTNET || CHAIN_ID === ChainId.Kovan) {
    return new BigNumberInWei(DEFAULT_GAS_PRICE).toString()
  }

  try {
    return await fetchGasPriceFromEthGasStation()
  } catch (e) {
    //
  }

  try {
    return await fetchGasPriceFromEtherchain()
  } catch (e) {
    //
  }

  return new BigNumberInWei(DEFAULT_GAS_PRICE).toString()
}
