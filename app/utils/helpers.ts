import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { Network } from '@injectivelabs/networks'
import {
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS,
  NETWORK,
  ENDPOINTS
} from './constants'

export const getSignificantDecimalsFromNumber = (
  number: number | string
): number => {
  if (Math.floor(new BigNumber(number).toNumber()) === number) {
    return 0
  }

  const decimals = number.toString().split('.')[1]

  if (!decimals.length) {
    return 0
  }

  return decimals.replace('0', '').length || 0
}

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

export const getExactDecimalsFromNumber = (number: number | string): number => {
  if (Number(number) % 1 !== 0 || number.toString().includes('.')) {
    const [, decimals] = number.toString().split('.')

    return decimals.length
  }
  return 0
}

export const getDecimalsFromNumber = (number: number | string): number => {
  const actualDecimals = getExactDecimalsFromNumber(number)

  return actualDecimals > UI_DEFAULT_MAX_DISPLAY_DECIMALS
    ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
    : actualDecimals
}

export const getChronosDatafeedEndpoint = (marketType: string): string => {
  return `${ENDPOINTS.exchangeApi}/api/chronos/v1/${marketType}`
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

export const getReferralUrl = (): string => {
  if ([Network.Devnet, Network.Testnet, Network.TestnetK8s].includes(NETWORK)) {
    return 'https://devnet.referral.injective.dev/'
  }

  return 'https://referrals.injective.exchange/'
}
