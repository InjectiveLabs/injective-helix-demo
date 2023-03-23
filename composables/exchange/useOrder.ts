import type { Ref } from 'vue'
import {
  ZERO_IN_BASE,
  UiSpotLimitOrder,
  UiSpotMarketWithToken,
  UiDerivativeLimitOrder
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { UiMarketWithToken } from '@/types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useOrder(
  order: Ref<UiDerivativeLimitOrder | UiSpotLimitOrder>,
  isSpot: Ref<boolean>
) {
  const derivativeStore = useDerivativeStore()
  const spotStore = useSpotStore()

  const markets: UiMarketWithToken[] = isSpot.value
    ? spotStore.markets
    : derivativeStore.markets

  const market = computed(() =>
    markets.find((m) => m.marketId === order.value.marketId)
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

  const isReduceOnly = computed(() => {
    if (isSpot.value || !margin.value) {
      return false
    }

    return (
      (order.value as UiDerivativeLimitOrder).isReduceOnly ||
      margin.value.isZero()
    )
  })

  const isBuy = computed(() => {
    if (isSpot.value) {
      return (order.value as UiSpotLimitOrder).orderSide === OrderSide.Buy
    }

    switch ((order.value as UiDerivativeLimitOrder).orderType) {
      case OrderSide.TakeBuy:
      case OrderSide.StopBuy:
      case OrderSide.Buy:
      case OrderSide.BuyPO:
        return true
      default:
        return false
    }
  })

  const margin = computed(() => {
    if (!market.value || isSpot.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(
      (order.value as UiDerivativeLimitOrder).margin
    ).toBase(market.value.quoteToken.decimals)
  })

  const price = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return isSpot.value && market.value.baseToken
      ? new BigNumberInBase(
          new BigNumberInBase(order.value.price).toWei(
            market.value.baseToken.decimals - market.value.quoteToken.decimals
          )
        )
      : new BigNumberInWei(order.value.price).toBase(
          market.value.quoteToken.decimals
        )
  })

  const quantity = computed(() => {
    if (!market) {
      return ZERO_IN_BASE
    }

    return isSpot.value
      ? new BigNumberInWei(order.value.quantity).toBase(
          (market.value as UiSpotMarketWithToken).baseToken.decimals
        )
      : new BigNumberInBase(order.value.quantity)
  })

  const unfilledQuantity = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return isSpot.value
      ? new BigNumberInWei(order.value.unfilledQuantity).toBase(
          (market.value as UiSpotMarketWithToken).baseToken.decimals
        )
      : new BigNumberInBase(order.value.unfilledQuantity)
  })

  const filledQuantity = computed(() =>
    quantity.value.minus(unfilledQuantity.value)
  )

  const leverage = computed(() => {
    if (isReduceOnly.value || isSpot.value) {
      return new BigNumberInBase('')
    }

    return new BigNumberInBase(
      price.value.times(quantity.value).dividedBy(margin.value)
    )
  })

  const filledQuantityPercentage = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    if (filledQuantity.value.lte(0)) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      filledQuantity.value.dividedBy(quantity.value).times(100)
    )
  })

  const filledQuantityPercentageToFormat = computed(() =>
    filledQuantityPercentage.value.toFormat(2)
  )

  const orderFillable = computed(() =>
    unfilledQuantity.value.lte(quantity.value)
  )

  const total = computed(() => quantity.value.multipliedBy(price.value))

  return {
    isBuy,
    price,
    total,
    margin,
    market,
    quantity,
    leverage,
    isReduceOnly,
    priceDecimals,
    orderFillable,
    filledQuantity,
    unfilledQuantity,
    quantityDecimals,
    filledQuantityPercentageToFormat
  }
}
