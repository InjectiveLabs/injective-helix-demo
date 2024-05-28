import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeDirection } from '@injectivelabs/ts-types'
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useDerivativePosition(position: Ref<Position | PositionV2>) {
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

    return new BigNumberInWei(position.value.margin).toBase(
      market.value.quoteToken.decimals
    )
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

    return new BigNumberInWei(position.value.markPrice).toBase(
      market.value.quoteToken.decimals
    )
  })

  const markPrice = computed(() => {
    if (!market.value) {
      return markPriceNotScaled.value
    }

    if (!market.value.oracleScaleFactor) {
      return markPriceNotScaled.value
    }

    if (!market.value.oracleScaleFactor) {
      return markPriceNotScaled.value
    }

    if (market.value.quoteToken.decimals === market.value.oracleScaleFactor) {
      return markPriceNotScaled.value
    }

    const oracleScalePriceDiff =
      market.value.oracleScaleFactor - market.value.quoteToken.decimals

    return new BigNumberInBase(markPriceNotScaled.value).times(
      new BigNumberInBase(10).pow(oracleScalePriceDiff)
    )
  })

  const priceDecimals = computed(() => {
    return market.value
      ? market.value.priceDecimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  })

  const quantityDecimals = computed(() => {
    return market.value
      ? market.value.quantityDecimals
      : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  })

  const price = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(position.value.entryPrice).toBase(
      market.value.quoteToken.decimals
    )
  })

  const liquidationPrice = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const liquidationPrice = new BigNumberInWei(
      position.value.liquidationPrice
    ).toBase(market.value.quoteToken.decimals)

    return liquidationPrice.gt(0) ? liquidationPrice : new BigNumberInBase(0)
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
    effectiveLeverage
  }
}
