import type { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiPriceLevel,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'

const DEFAULT_MARKET_PRICE_WARNING_DEVIATION = 10

export function useSpotError({
  executionPrice,
  formValues,
  isBuy,
  market,
  notionalWithFees,
  quoteAvailableBalance
}: {
  executionPrice: Ref<BigNumberInBase>
  formValues: Ref<TradeForm>
  isBuy: Ref<boolean>
  market: Ref<UiSpotMarketWithToken>
  notionalWithFees?: Ref<BigNumberInBase>
  quoteAvailableBalance?: Ref<BigNumberInBase>
}) {
  const spotStore = useSpotStore()

  const tradingTypeMarket = computed(
    () => formValues.value[TradeField.TradingType] === TradeExecutionType.Market
  )

  const orderbookOrders = computed<UiPriceLevel[] | undefined>(() =>
    isBuy.value ? spotStore.orderbook?.sells : spotStore.orderbook?.buys
  )

  const lastTradedPrice = computed(() => {
    if (spotStore.trades.length === 0 || !market.value) {
      return ZERO_IN_BASE
    }

    const [trade] = spotStore.trades

    return new BigNumberInBase(
      new BigNumberInWei(trade.price).toBase(
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

    return deviation.gt(DEFAULT_MARKET_PRICE_WARNING_DEVIATION)
  })

  const availableBalanceError = computed(() => {
    if (
      !quoteAvailableBalance ||
      !quoteAvailableBalance.value ||
      !notionalWithFees ||
      !notionalWithFees.value
    ) {
      return false
    }

    return isBuy.value && quoteAvailableBalance.value.lt(notionalWithFees.value)
  })

  const subaccountOrders = computed(() =>
    spotStore.subaccountOrders.filter((order) => {
      if (!market.value) {
        return false
      }

      return (
        order.orderSide === formValues.value[TradeField.OrderType] &&
        order.marketId === market.value.marketId
      )
    })
  )

  const maxOrdersError = computed(() => {
    return (
      !tradingTypeMarket.value &&
      subaccountOrders.value &&
      subaccountOrders.value.length >= UI_DEFAULT_MAX_NUMBER_OF_ORDERS
    )
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
    availableBalanceError,
    highDeviation,
    maxOrdersError,
    insufficientLiquidity
  }
}
