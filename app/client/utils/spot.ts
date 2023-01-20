import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { UiOrderbookPriceLevel } from '@injectivelabs/sdk-ui-ts'

export const computeOrderbookSummary = (
  summary: { quantity: BigNumberInWei; total: BigNumberInBase },
  record: UiOrderbookPriceLevel
) => {
  return {
    quantity: summary.quantity.plus(new BigNumberInWei(record.quantity)),
    total: summary.total.plus(new BigNumberInBase(record.total || 0))
  }
}
