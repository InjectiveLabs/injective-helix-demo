import { PositionV2 } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { calculateScaledMarkPrice } from '@/app/client/utils/derivatives'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useDerivativePosition(position: Ref<PositionV2>) {
  const derivativeStore = useDerivativeStore()

  const market = computed(() => {
    return derivativeStore.markets.find(
      (m) => m.marketId === position.value.marketId
    )
  })

  const margin = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: position.value.margin,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })

  const quantity = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(position.value.quantity)
  })

  const markPriceNotScaled = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const markPriceFromStream =
      derivativeStore.marketMarkPriceMap[market.value.marketId]

    if (markPriceFromStream) {
      return new BigNumberInBase(markPriceFromStream.price)
    }

    return sharedToBalanceInTokenInBase({
      value: position.value.markPrice,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })

  const markPrice = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return calculateScaledMarkPrice({
      market: market.value,
      markPriceNotScaled: markPriceNotScaled.value
    })
  })

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

  const price = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: position.value.entryPrice,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })

  const liquidationPrice = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const liquidationPrice = sharedToBalanceInTokenInBase({
      value: position.value.liquidationPrice,
      decimalPlaces: market.value.quoteToken.decimals
    })

    return liquidationPrice.gt(0) ? liquidationPrice : ZERO_IN_BASE
  })

  const pnl = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(position.value.quantity)
      .times(markPrice.value.minus(price.value))
      .times(position.value.direction === TradeDirection.Long ? 1 : -1)
  })

  const percentagePnl = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    if (pnl.value.isNaN()) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(pnl.value.dividedBy(margin.value).times(100))
  })

  const effectiveLeverage = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    if (
      margin.value.lte(0) ||
      notionalValue.value.lte(0) ||
      pnl.value.isNaN()
    ) {
      return ZERO_IN_BASE
    }

    const effectiveLeverage = new BigNumberInBase(
      notionalValue.value.dividedBy(margin.value.plus(pnl.value))
    )

    return effectiveLeverage.gt(0) ? effectiveLeverage : new BigNumberInBase(0)
  })

  const notionalValue = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return markPrice.value.times(quantity.value)
  })

  return {
    pnl,
    price,
    margin,
    market,
    quantity,
    markPrice,
    priceDecimals,
    percentagePnl,
    notionalValue,
    quantityDecimals,
    liquidationPrice,
    effectiveLeverage,
    markPriceNotScaled
  }
}
