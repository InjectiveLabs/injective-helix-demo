import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketChange, type SharedUiMarketSummary } from './../../types'
import type { AllChronosDerivativeMarketSummary } from '@injectivelabs/sdk-ts'

export const toZeroUiMarketSummary = (
  marketId: string
): SharedUiMarketSummary => ({
  marketId,
  change: NaN,
  high: NaN,
  low: NaN,
  open: NaN,
  price: NaN,
  volume: NaN,
  lastPrice: NaN,
  lastPriceChange: SharedMarketChange.NoChange
})

const getChangeStateFromPrice = (change: number) => {
  const changeInBigNumber = new BigNumberInBase(change)

  if (changeInBigNumber.eq(0)) {
    return SharedMarketChange.NoChange
  }

  return changeInBigNumber.gt(0)
    ? SharedMarketChange.Increase
    : SharedMarketChange.Decrease
}

export const toUiMarketSummary = (
  marketSummary: AllChronosDerivativeMarketSummary
): SharedUiMarketSummary => {
  return {
    ...marketSummary,
    lastPrice: marketSummary.price,
    lastPriceChange: getChangeStateFromPrice(marketSummary.change)
  }
}
