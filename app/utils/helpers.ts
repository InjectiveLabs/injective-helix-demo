import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { Network } from '@injectivelabs/networks'
import { UI_DEFAULT_DISPLAY_DECIMALS, NETWORK, ENDPOINTS } from './constants'

export const getDecimalsBasedOnNumber = (
  number: number | string | BigNumber,
  defaultDecimals = UI_DEFAULT_DISPLAY_DECIMALS
): { number: BigNumberInBase; decimals: number } => {
  const actualNumber = new BigNumber(number)

  if (actualNumber.gte(1e6)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(0)),
      decimals: 0
    }
  }

  if (actualNumber.gte(1e4)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(1)),
      decimals: 1
    }
  }

  return {
    number: new BigNumberInBase(actualNumber.toFixed(defaultDecimals)),
    decimals: defaultDecimals
  }
}

export const getChronosDatafeedEndpoint = (marketType: string): string => {
  return `${ENDPOINTS.indexer}/api/chronos/v1/${marketType}`
}

export const getHubUrl = (): string => {
  if ([Network.Devnet, Network.Local].includes(NETWORK)) {
    return 'https://devnet.hub.injective.dev'
  }

  if ([Network.Testnet, Network.TestnetK8s].includes(NETWORK)) {
    return 'https://hub.injective.dev'
  }

  return 'https://hub.injective.network'
}

export const getSubaccountIndex = (subaccount: string) =>
  parseInt(subaccount.slice(42))
