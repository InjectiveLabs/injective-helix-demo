import type { Ref } from 'vue'
import { MarketType, UiPosition, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { PositionsWithUPNL } from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { PositionWithPnlAndDenom } from '@/types'

export function useDerivativePosition(position: Ref<UiPosition>) {
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
      market.value.quoteToken.decimals - market.value.oracleScaleFactor

    return oracleScalePriceDiff > 0
      ? new BigNumberInBase(markPriceNotScaled.value).times(
          new BigNumberInBase(10).pow(oracleScalePriceDiff)
        )
      : new BigNumberInBase(markPriceNotScaled.value).div(
          new BigNumberInBase(10).pow(oracleScalePriceDiff)
        )
  })

  const isBinaryOptions = computed(() => {
    if (!market.value) {
      return false
    }

    return market.value.subType === MarketType.BinaryOptions
  })

  const priceDecimals = computed(() => {
    if (isBinaryOptions.value) {
      return UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS
    }

    return market.value
      ? market.value.priceDecimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  })

  const quantityDecimals = computed(() => {
    if (isBinaryOptions.value) {
      return UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS
    }

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

    return isBinaryOptions.value
      ? price.value.times(quantity.value)
      : markPrice.value.times(quantity.value)
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
    isBinaryOptions,
    quantityDecimals,
    liquidationPrice,
    effectiveLeverage
  }
}

export function usePositionWithDenom(
  positionWithPnl: PositionsWithUPNL
): PositionWithPnlAndDenom {
  const derivativeStore = useDerivativeStore()

  if (!positionWithPnl.position) {
    return {
      ...positionWithPnl,
      denom: undefined
    }
  }

  const market = derivativeStore.markets.find(
    (m) => m.marketId === positionWithPnl.position!.marketId
  )

  if (!market) {
    return {
      ...positionWithPnl,
      denom: undefined
    }
  }

  const quoteDenom = market.quoteDenom

  return {
    ...positionWithPnl,
    denom: quoteDenom
  }
}
