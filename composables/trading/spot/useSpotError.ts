import type { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  UiPriceLevel,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { DEFAULT_PRICE_WARNING_DEVIATION } from '@/app/utils/constants'
import { TradeField, TradeForm } from '@/types'

export function useSpotError({
  isBuy,
  market,
  formValues,
  executionPrice,
  notionalWithFees,
  quoteAvailableBalance
}: {
  isBuy: Ref<boolean>
  market: Ref<UiSpotMarketWithToken>
  formValues: Ref<Partial<TradeForm>>
  executionPrice: Ref<BigNumberInBase>
  notionalWithFees?: Ref<BigNumberInBase>
  quoteAvailableBalance?: Ref<BigNumberInBase>
}) {
  const spotStore = useSpotStore()

  const orderbookOrders = computed(
    () => (isBuy.value ? spotStore.sells : spotStore.buys) as UiPriceLevel[]
  )

  const lastTradedPrice = computed(() => {
    if (spotStore.trades.length === 0 || !market.value) {
      return ZERO_IN_BASE
    }

    const [trade] = spotStore.trades

    return new BigNumberInBase(
      new BigNumberInBase(trade.price).toWei(
        market.value.baseToken.decimals - market.value.quoteToken.decimals
      )
    )
  })

  const highDeviation = computed<boolean>(() => {
    const quantity = new BigNumberInBase(
      formValues.value[TradeField.BaseAmount] || 0
    )

    if (
      executionPrice.value.lte(0) ||
      lastTradedPrice.value.lte(0) ||
      quantity.lte(0)
    ) {
      return false
    }

    const deviationPrice = isBuy.value
      ? lastTradedPrice.value.div(executionPrice.value)
      : executionPrice.value.div(lastTradedPrice.value)
    const deviation = new BigNumberInBase(1).minus(deviationPrice).times(100)

    return deviation.gt(DEFAULT_PRICE_WARNING_DEVIATION)
  })

  /*
  prevents user from entering too high of a quote amount field compared to their available balance
  */
  const availableBalanceError = computed(() => {
    if (
      !notionalWithFees ||
      !quoteAvailableBalance ||
      !notionalWithFees.value ||
      !quoteAvailableBalance.value
    ) {
      return false
    }

    return isBuy.value && quoteAvailableBalance.value.lt(notionalWithFees.value)
  })

  const insufficientLiquidity = computed<boolean>(() => {
    const quantity = new BigNumberInBase(
      formValues.value[TradeField.BaseAmount] || 0
    )

    if (quantity.lte(0) || !orderbookOrders.value || !market.value) {
      return false
    }

    const { baseToken } = market.value
    const totalFillableQuantity = orderbookOrders.value.reduce(
      (totalAmount, { quantity }) => {
        return totalAmount.plus(
          new BigNumberInWei(quantity).toBase(baseToken.decimals)
        )
      },
      ZERO_IN_BASE
    )

    return quantity.gt(totalFillableQuantity)
  })

  return {
    highDeviation,
    insufficientLiquidity,
    availableBalanceError
  }
}
