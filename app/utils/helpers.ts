import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from './constants'
import { Change, UiDerivativeMarketSummary, UiSpotMarketSummary } from '~/types'

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

export const getDecimalsFromNumber = (number: number | string): number => {
  const numberToBn = new BigNumber(number).toNumber()
  const numberParts = numberToBn.toString().split('.')
  const [, decimals] = numberParts

  const actualDecimals = decimals ? decimals.length : 1

  return actualDecimals > UI_DEFAULT_MAX_DISPLAY_DECIMALS
    ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
    : actualDecimals
}

export const zeroDerivativeMarketSummary = (
  marketId: string
): UiDerivativeMarketSummary => {
  return {
    marketId,
    change: NaN,
    high: NaN,
    low: NaN,
    open: NaN,
    price: NaN,
    volume: NaN,
    lastPrice: NaN,
    lastPriceChange: Change.NoChange
  }
}

export const zeroSpotMarketSummary = (
  marketId: string
): UiSpotMarketSummary => {
  return {
    marketId,
    change: NaN,
    high: NaN,
    low: NaN,
    open: NaN,
    price: NaN,
    volume: NaN,
    lastPrice: NaN,
    lastPriceChange: Change.NoChange
  }
}
