import {
  Position,
  PositionV2,
  derivativePriceToChainPrice,
  formatAmountToAllowableAmount
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiDerivativeMarket,
  DerivativeTradeTypes,
  UiAggregatedPriceLevel
} from '@/types'

export const calculateMargin = ({
  quantity,
  price,
  tensMultiplier,
  quoteTokenDecimals,
  leverage
}: {
  quantity: string
  price: string
  tensMultiplier: number
  quoteTokenDecimals: number
  leverage: string
}): BigNumberInBase => {
  const margin = new BigNumberInBase(quantity).times(price).dividedBy(leverage)
  const marginInWei = margin.toWei(quoteTokenDecimals)
  const allowableMargin = formatAmountToAllowableAmount(
    marginInWei.toFixed(),
    tensMultiplier
  )

  return new BigNumberInBase(
    new BigNumberInWei(allowableMargin).toBase(quoteTokenDecimals).toFixed()
  )
}

export const computeOrderbookSummary = (
  summary: { quantity: string; total: string },
  record: UiAggregatedPriceLevel
) => {
  return {
    quantity: new BigNumberInBase(summary.quantity)
      .plus(record.quantity)
      .toFixed(),
    total: new BigNumberInBase(summary.total).plus(record.total || 0).toFixed()
  }
}

export const calculateLiquidationPrice = ({
  price,
  quantity,
  notionalWithLeverage,
  orderType,
  market: { maintenanceMarginRatio }
}: {
  price: string
  quantity: string
  notionalWithLeverage: string
  orderType: OrderSide
  market: UiDerivativeMarket
}): BigNumberInBase => {
  if (!price || !quantity || !notionalWithLeverage) {
    return ZERO_IN_BASE
  }

  const isBuy = orderType === OrderSide.Buy

  const numerator = isBuy
    ? new BigNumberInBase(notionalWithLeverage).minus(
        new BigNumberInBase(price).times(quantity)
      )
    : new BigNumberInBase(notionalWithLeverage).plus(
        new BigNumberInBase(price).times(quantity)
      )

  const maintenanceMarginRatioFactor = isBuy
    ? new BigNumberInBase(maintenanceMarginRatio).minus(1)
    : new BigNumberInBase(maintenanceMarginRatio)

  const denominator = isBuy
    ? maintenanceMarginRatioFactor.times(quantity)
    : maintenanceMarginRatioFactor.times(quantity).plus(quantity)

  const liquidationPrice = numerator.dividedBy(denominator)

  return liquidationPrice.gte(0) ? liquidationPrice : ZERO_IN_BASE
}

export const getRoundedLiquidationPrice = (
  position: Position | PositionV2,
  market: UiDerivativeMarket
) => {
  const minTickPrice = derivativePriceToChainPrice({
    value: new BigNumberInBase(1).shiftedBy(-market.priceDecimals).toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const liquidationPrice = new BigNumberInWei(position.liquidationPrice)
  const liquidationPriceRoundedToMinTickPrice = new BigNumberInBase(
    liquidationPrice.dividedBy(minTickPrice).toFixed(0)
  ).multipliedBy(minTickPrice)

  if (liquidationPriceRoundedToMinTickPrice.gt(0)) {
    return liquidationPriceRoundedToMinTickPrice
  }

  return new BigNumberInBase(
    new BigNumberInBase(market.minNotional)
      .dividedBy(position.quantity)
      .dividedBy(minTickPrice)
      .toFixed(0, BigNumberInBase.ROUND_UP)
  ).multipliedBy(minTickPrice)
}

export const calculateScaledMarkPrice = ({
  market,
  markPriceNotScaled
}: {
  market: UiDerivativeMarket
  markPriceNotScaled: BigNumberInBase
}) => {
  if (markPriceNotScaled.isZero()) {
    return markPriceNotScaled
  }

  if (!market.oracleScaleFactor) {
    return markPriceNotScaled
  }

  if (market.quoteToken.decimals === market.oracleScaleFactor) {
    return markPriceNotScaled
  }

  const oracleScalePriceDiff =
    market.oracleScaleFactor - market.quoteToken.decimals

  return markPriceNotScaled.times(
    new BigNumberInBase(10).pow(oracleScalePriceDiff)
  )
}

export const calculateIfPositionIsLiquidatable = ({
  isBuy,
  tradeType,
  limitPrice,
  triggerPrice,
  lastTradedPrice,
  liquidationPrice
}: {
  isBuy: boolean
  tradeType: DerivativeTradeTypes
  limitPrice: BigNumberInBase
  triggerPrice: BigNumberInBase
  lastTradedPrice: BigNumberInBase
  liquidationPrice: BigNumberInBase
}): boolean => {
  let comparePrice

  switch (tradeType) {
    case DerivativeTradeTypes.Market: {
      comparePrice = lastTradedPrice

      break
    }
    case DerivativeTradeTypes.Limit: {
      comparePrice = limitPrice

      break
    }
    case DerivativeTradeTypes.StopMarket: {
      comparePrice = triggerPrice

      break
    }
    case DerivativeTradeTypes.StopLimit: {
      comparePrice = limitPrice

      break
    }
    default: {
      comparePrice = new BigNumberInBase(0)
    }
  }

  return isBuy
    ? comparePrice.lt(liquidationPrice)
    : comparePrice.gt(liquidationPrice)
}
