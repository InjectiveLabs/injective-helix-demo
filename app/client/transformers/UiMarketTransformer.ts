import { AllChronosDerivativeMarketSummary } from '@injectivelabs/sdk-ts'
import { Change } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketSummary } from '@/types'

const getChangeStateFromPrice = (change: number) => {
  const changeInBigNumber = new BigNumberInBase(change)

  if (changeInBigNumber.eq(0)) {
    return Change.NoChange
  }

  return changeInBigNumber.gt(0) ? Change.Increase : Change.Decrease
}

export class UiMarketTransformer {
  static convertMarketSummaryToUiMarketSummary(
    marketSummary: AllChronosDerivativeMarketSummary
  ): UiMarketSummary {
    return {
      ...marketSummary,
      lastPrice: marketSummary.price,
      lastPriceChange: getChangeStateFromPrice(marketSummary.change)
    }
  }
}
