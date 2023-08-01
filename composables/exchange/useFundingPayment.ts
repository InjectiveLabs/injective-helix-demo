import type { Ref } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { format } from 'date-fns'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useFundingPayment(fundingPayment: Ref<FundingPayment>) {
  const derivativeStore = useDerivativeStore()

  const UI_MINIMAL_AMOUNT = new BigNumberInWei(1).shiftedBy(-6)

  const market = computed(() =>
    derivativeStore.markets.find(
      (m) => m.marketId === fundingPayment.value.marketId
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
    if (!fundingPayment.value.amount) {
      return ZERO_IN_BASE
    }

    if (!market.value) {
      return ZERO_IN_BASE
    }

    const decimals = market.value
      ? market.value.quoteToken.decimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

    return new BigNumberInWei(fundingPayment.value.amount).toBase(decimals)
  })

  const time = computed(() => {
    if (!fundingPayment.value.timestamp) {
      return ''
    }

    return format(fundingPayment.value.timestamp, DATE_TIME_DISPLAY)
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
