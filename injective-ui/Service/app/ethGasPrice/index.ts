import { fetchEstimatorGasPrice } from './estimator'
import { GWEI_IN_WEI, DEFAULT_MAINNET_GAS_PRICE } from '../../../utils/constant'
import {
  GeneralException,
  HttpRequestException
} from '@injectivelabs/exceptions'
import {
  BigNumber,
  HttpClient,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { getAlchemyClient } from './../../shared'

export interface GasInfo {
  gasPrice: string
  estimatedTimeMs: number
}

export interface EtherchainResult {
  fast: number
  fastest: number
  safeLow: number
  standard: number
  currentBaseFee: number
  recommendedBaseFee: number
}

export interface EthGasStationResult {
  fast: number
  speed: number
  average: number
  avgWait: number
  fastest: number
  safeLow: number
  fastWait: number
  blockNum: number
  block_time: number
  fastestWait: number
  safeLowWait: number
}

const fetchGasPriceFromAlchemy = async (): Promise<string> => {
  try {
    const alchemy = await getAlchemyClient()
    const response = await alchemy.core.getFeeData()

    if (!response) {
      throw new GeneralException(new Error('No response from Alchemy'))
    }

    if (response.maxFeePerGas) {
      return response.maxFeePerGas.toString()
    }

    const gasPrice = await alchemy.core.getGasPrice()

    if (!gasPrice) {
      throw new GeneralException(
        new Error('No gas price response from Alchemy')
      )
    }

    return new BigNumberInBase(gasPrice.toString()).toFixed()
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new GeneralException(new Error(e as any))
  }
}

export const fetchGasPriceFromEtherchain = async (): Promise<string> => {
  try {
    const endpoint = 'https://www.etherchain.org/api/gasPriceOracle'
    const response = (await new HttpClient(endpoint).get('')) as {
      data: EtherchainResult
    }

    if (!response || (response && !response.data)) {
      throw new GeneralException(new Error('No response from Etherchain'))
    }

    return new BigNumberInWei(
      new BigNumber(response.data.recommendedBaseFee).multipliedBy(GWEI_IN_WEI)
    ).toFixed(0)
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new GeneralException(new Error(e as any))
  }
}

export const fetchGasPriceFromEthGasStation = async (): Promise<string> => {
  try {
    const endpoint = 'https://ethgasstation.info/json/ethgasAPI.json'
    const response = (await new HttpClient(endpoint).get('')) as {
      data: EthGasStationResult
    }

    if (!response || (response && !response.data)) {
      throw new HttpRequestException(
        new Error('No response from Ethgasstation'),
        {
          context: endpoint
        }
      )
    }

    return new BigNumberInWei(
      new BigNumber(response.data.fastest / 10)
        .times(2.125)
        .multipliedBy(GWEI_IN_WEI)
    ).toFixed(0)
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new HttpRequestException(new Error(e as any))
  }
}

export const fetchGasPrice = async (): Promise<string> => {
  try {
    const gasPrice = await fetchEstimatorGasPrice()

    if (gasPrice) {
      return gasPrice.fast.toString()
    }
  } catch {
    //
  }

  try {
    const gasPrice = await fetchGasPriceFromAlchemy()

    if (gasPrice) {
      return gasPrice.toString()
    }
  } catch {
    //
  }

  return new BigNumberInWei(DEFAULT_MAINNET_GAS_PRICE).toString()
}
