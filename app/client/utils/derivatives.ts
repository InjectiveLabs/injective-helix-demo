import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  UiOrderbookPriceLevel,
  UiPerpetualMarketWithToken,
  UiPosition,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  derivativePriceToChainPrice,
  formatAmountToAllowableAmount
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'

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

export const calculateBinaryOptionsMargin = ({
  quantity,
  price,
  orderSide,
  tensMultiplier,
  quoteTokenDecimals
}: {
  quantity: string
  price: string
  tensMultiplier: number
  quoteTokenDecimals: number
  orderSide: OrderSide
}): BigNumberInBase => {
  const margin =
    orderSide === OrderSide.Buy
      ? new BigNumberInBase(quantity).times(price)
      : new BigNumberInBase(quantity).times(new BigNumberInBase(1).minus(price))
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
  summary: { quantity: BigNumberInBase; total: BigNumberInBase },
  record: UiOrderbookPriceLevel
) => {
  return {
    quantity: summary.quantity.plus(new BigNumberInBase(record.quantity)),
    total: summary.total.plus(new BigNumberInBase(record.total || 0))
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
  market: UiPerpetualMarketWithToken | UiExpiryFuturesMarketWithToken
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
  position: UiPosition,
  market: UiDerivativeMarketWithToken
) => {
  const minTickPrice = derivativePriceToChainPrice({
    value: new BigNumberInBase(1).shiftedBy(-market.priceDecimals),
    quoteDecimals: market.quoteToken.decimals
  })
  const liquidationPrice = new BigNumberInWei(position.liquidationPrice)
  const liquidationPriceRoundedToMinTickPrice = new BigNumberInBase(
    liquidationPrice.dividedBy(minTickPrice).toFixed(0)
  ).multipliedBy(minTickPrice)

  return liquidationPriceRoundedToMinTickPrice.lte(0)
    ? minTickPrice
    : liquidationPriceRoundedToMinTickPrice
}
