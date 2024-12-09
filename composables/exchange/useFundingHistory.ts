import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useFundingHistory(fundingHistory: Ref<FundingPayment>) {
  const derivativeStore = useDerivativeStore()

  const UI_MINIMAL_AMOUNT = new BigNumberInWei(1).shiftedBy(-6)

  const market = computed(() =>
    derivativeStore.markets.find(
      (m) => m.marketId === fundingHistory.value.marketId
    )
  )

  const priceDecimals = computed(() =>
    market.value
      ? market.value.priceDecimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  )

  const quantityDecimals = computed(() =>
    market.value
      ? market.value.quantityDecimals
      : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  )

  const total = computed(() => {
    if (!fundingHistory.value.amount) {
      return ZERO_IN_BASE
    }

    if (!market.value) {
      return ZERO_IN_BASE
    }

    const decimals = market.value
      ? market.value.quoteToken.decimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

    return new BigNumberInWei(fundingHistory.value.amount).toBase(decimals)
  })

  const time = computed(() => {
    if (!fundingHistory.value.timestamp) {
      return ''
    }

    return format(fundingHistory.value.timestamp, DATE_TIME_DISPLAY)
  })

  return {
    time,
    total,
    market,
    priceDecimals,
    quantityDecimals,
    minimalDisplayAmount: UI_MINIMAL_AMOUNT
  }
}
