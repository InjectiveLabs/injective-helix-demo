import { OrderSide } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { SpotLimitOrder, DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { UiSpotMarket, UiMarketWithToken } from '@/types'

export function useOrder(
  order: Ref<SpotLimitOrder | DerivativeLimitOrder>,
  isSpot: boolean
) {
  const derivativeStore = useDerivativeStore()
  const spotStore = useSpotStore()

  const markets: UiMarketWithToken[] = isSpot
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
    if (isSpot || !margin.value) {
      return false
    }

    return (
      (order.value as DerivativeLimitOrder).isReduceOnly ||
      margin.value.isZero()
    )
  })

  const isBuy = computed(() => {
    if (isSpot) {
      return (order.value as SpotLimitOrder).orderSide === OrderSide.Buy
    }

    switch ((order.value as DerivativeLimitOrder).orderType) {
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
    if (!market.value || isSpot) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(
      (order.value as DerivativeLimitOrder).margin
    ).toBase(market.value.quoteToken.decimals)
  })

  const price = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return isSpot && market.value.baseToken
      ? sharedToBalanceInWei({
          value: order.value.price,
          decimalPlaces:
            market.value.baseToken.decimals - market.value.quoteToken.decimals
        })
      : new BigNumberInWei(order.value.price).toBase(
          market.value.quoteToken.decimals
        )
  })

  const quantity = computed(() => {
    if (!market) {
      return ZERO_IN_BASE
    }

    return isSpot
      ? new BigNumberInWei(order.value.quantity).toBase(
          (market.value as UiSpotMarket).baseToken.decimals
        )
      : new BigNumberInBase(order.value.quantity)
  })

  const unfilledQuantity = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return isSpot
      ? new BigNumberInWei(order.value.unfilledQuantity).toBase(
          (market.value as UiSpotMarket).baseToken.decimals
        )
      : new BigNumberInBase(order.value.unfilledQuantity)
  })

  const filledQuantity = computed(() =>
    quantity.value.minus(unfilledQuantity.value)
  )

  const leverage = computed(() => {
    if (isReduceOnly.value || isSpot) {
      return new BigNumberInBase('')
    }

    const priceInBigNumber = new BigNumberInBase(price.value)

    return new BigNumberInBase(
      priceInBigNumber.times(quantity.value).dividedBy(margin.value)
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
