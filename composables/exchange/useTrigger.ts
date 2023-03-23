import type { Ref } from 'vue'
import {
  UiDerivativeOrderHistory,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  OrderSide,
  OrderState,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useTrigger(trigger: Ref<UiDerivativeOrderHistory>) {
  const derivativeStore = useDerivativeStore()
  const { t } = useLang()

  const market = computed(() =>
    derivativeStore.markets.find((m) => m.marketId === trigger.value.marketId)
  )

  const isMarketOrder = computed(() => trigger.value.executionType === 'market')

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

  const isReduceOnly = computed(() => {
    if (trigger.value.isReduceOnly) {
      return true
    }

    return margin.value.isZero()
  })

  const price = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trigger.value.price).toBase(
      market.value.quoteToken.decimals
    )
  })

  const triggerPrice = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trigger.value.triggerPrice).toBase(
      market.value.quoteToken.decimals
    )
  })

  const margin = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trigger.value.margin).toBase(
      market.value.quoteToken.decimals
    )
  })

  const quantity = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(trigger.value.quantity)
  })

  const filledQuantity = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(trigger.value.filledQuantity)
  })

  const leverage = computed(() => {
    if (isReduceOnly.value) {
      return new BigNumberInBase('')
    }

    return new BigNumberInBase(
      price.value.times(quantity.value).dividedBy(margin.value)
    )
  })

  const isCancelable = computed(() => trigger.value.state === OrderState.Booked)

  const total = computed(() => price.value.multipliedBy(quantity.value))

  const isBuy = computed(() => {
    if (trigger.value.direction === OrderSide.Buy) {
      return true
    }

    switch (trigger.value.orderType) {
      case OrderSide.TakeBuy:
      case OrderSide.StopBuy:
      case OrderSide.Buy:
      case OrderSide.BuyPO:
        return true
      default:
        return false
    }
  })

  const isStopLoss = computed(
    () =>
      trigger.value.orderType === OrderSide.StopBuy ||
      trigger.value.orderType === OrderSide.StopSell
  )

  const isTakeProfit = computed(
    () =>
      trigger.value.orderType === OrderSide.TakeBuy ||
      trigger.value.orderType === OrderSide.TakeSell
  )

  const type = computed(() => {
    const executionType =
      trigger.value.executionType === TradeExecutionType.Market
        ? t('trade.market')
        : t('trade.limit')

    switch (trigger.value.orderType) {
      case OrderSide.BuyPO:
      case OrderSide.SellPO:
        return executionType
      case OrderSide.TakeSell:
      case OrderSide.TakeBuy:
        return `${t('trade.takeProfit')} ${executionType}`
      case OrderSide.StopSell:
      case OrderSide.StopBuy:
        return `${t('trade.stopLoss')} ${executionType}`
      default:
        return ''
    }
  })

  return {
    type,
    isBuy,
    total,
    price,
    market,
    margin,
    quantity,
    leverage,
    isStopLoss,
    isReduceOnly,
    isCancelable,
    triggerPrice,
    isTakeProfit,
    filledQuantity,
    isMarketOrder,
    priceDecimals,
    quantityDecimals
  }
}
