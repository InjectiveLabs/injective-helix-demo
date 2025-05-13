import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { TransformedFundingHistory } from '@/types'
import type { FundingPayment } from '@injectivelabs/sdk-ts'

export function useFundingHistoryTransformer(
  fundingHistoryList: ComputedRef<FundingPayment[]>
) {
  const derivativeStore = useDerivativeStore()

  const rows = computed(() =>
    fundingHistoryList.value.reduce((list, fundingHistory) => {
      const market = derivativeStore.marketByIdOrSlug(fundingHistory.marketId)

      if (!market) {
        return list
      }

      const time = fundingHistory.timestamp
        ? format(fundingHistory.timestamp, DATE_TIME_DISPLAY)
        : ''

      const decimals =
        market.quoteToken?.decimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      const total = fundingHistory.amount
        ? new BigNumberInWei(fundingHistory.amount).toBase(decimals)
        : ZERO_IN_BASE

      list.push({
        time,
        total,
        market
      })

      return list
    }, [] as TransformedFundingHistory[])
  )

  return { rows }
}
