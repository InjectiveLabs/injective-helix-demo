import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { UiAggregatedPriceLevel } from '@/types'

export const computeOrderbookSummary = (
  summary: { quantity: string; total: string },
  record: UiAggregatedPriceLevel
) => {
  return {
    total: new BigNumberInBase(summary.total).plus(record.total || 0).toFixed(),
    quantity: new BigNumberInWei(summary.quantity)
      .plus(record.quantity)
      .toFixed()
  }
}
