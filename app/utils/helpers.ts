import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { Network } from '@injectivelabs/networks'
import {
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS,
  NETWORK
} from './constants'
import { app } from '~/app/singletons/App'

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

export const isNumericKeycode = (keyCode?: number) =>
  keyCode &&
  ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))

export const isDotKeycode = (keyCode?: number) =>
  keyCode && (keyCode === 190 || keyCode === 110)

export const getDecimalsFromNumber = (number: number | string): number => {
  const numberToBn = new BigNumber(number).toNumber()
  const numberParts = numberToBn.toString().split('.')
  const [, decimals] = numberParts

  const actualDecimals = decimals ? decimals.length : 0

  return actualDecimals > UI_DEFAULT_MAX_DISPLAY_DECIMALS
    ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
    : actualDecimals
}

export const getChronosDatafeedEndpoint = (marketType: string): string => {
  return `${app.endpoints.exchangeApi}/api/chronos/v1/${marketType}`
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
