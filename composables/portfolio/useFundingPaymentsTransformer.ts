import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { TransformedFundingPayment } from '@/types'

export function useFundingPaymentsTransformer(
  fundingPaymentList: ComputedRef<FundingPayment[]>
) {
  const derivativeStore = useDerivativeStore()

  const rows = computed(() =>
    fundingPaymentList.value.reduce((list, fundingPayment) => {
      const market = derivativeStore.markets.find(
        (market) => market.marketId === fundingPayment.marketId
      )

      if (!market) {
        return list
      }

      const time = fundingPayment.timestamp
        ? format(fundingPayment.timestamp, DATE_TIME_DISPLAY)
        : ''

      const decimals =
        market.quoteToken?.decimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      const total = fundingPayment.amount
        ? new BigNumberInWei(fundingPayment.amount).toBase(decimals)
        : ZERO_IN_BASE

      list.push({
        time,
        total,
        market
      })

      return list
    }, [] as TransformedFundingPayment[])
  )

  return { rows }
}
