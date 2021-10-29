import { getTokenMetaData } from '../services/tokens'
import { tokenMetaToToken } from './token'
import { BaseFeeDiscountSchedule, FeeDiscountSchedule } from '~/types/exchange'
import { Token } from '~/types'

export const feeDiscountScheduleToUiFeeDiscountSchedule = (
  feeDiscountSchedule: BaseFeeDiscountSchedule
): FeeDiscountSchedule => {
  return {
    ...feeDiscountSchedule,
    quoteTokenMeta: feeDiscountSchedule.quoteDenomsList
      .map((denom) => tokenMetaToToken(getTokenMetaData(denom), denom))
      .filter((token) => token) as Token[]
  }
}
