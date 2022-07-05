import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei,
  derivativePriceToChainPrice
} from '@injectivelabs/utils'
import {
  DerivativeOrderSide,
  UiBinaryOptionsMarketWithToken,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  UiOrderbookPriceLevel,
  UiPerpetualMarketWithToken,
  UiPosition,
  UiPriceLevel,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { formatAmountToAllowableDecimals } from '~/app/utils/formatters'

export const calculateMargin = ({
  quantity,
  price,
  leverage
}: {
  quantity: string
  price: string
  leverage: string
}): BigNumberInBase => {
  return new BigNumberInBase(quantity).times(price).dividedBy(leverage)
}

export const getAggregationPrice = ({
  price,
  aggregation,
  isBuy
}: {
  price: BigNumberInBase
  aggregation: number
  isBuy: boolean
}): BigNumberInBase => {
  const aggregateBy = new BigNumberInBase(10 ** Math.abs(aggregation))
  if (aggregation <= 0) {
    // handles 10, 100 and 1000
    return new BigNumberInBase(
      price
        .dividedBy(aggregateBy)
        .integerValue(isBuy ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL)
        .multipliedBy(aggregateBy)
    )
  }

  return new BigNumberInBase(
    price
      .decimalPlaces(
        aggregation,
        isBuy ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL
      )
      .multipliedBy(aggregateBy)
      .dividedBy(aggregateBy)
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

export const getPositionFeeAdjustedBankruptcyPrice = ({
  position,
  market
}: {
  position: UiPosition
  market: UiDerivativeMarketWithToken
}) => {
  const price = new BigNumberInWei(position.entryPrice).toBase(
    market.quoteToken.decimals
  )

  const unitMargin = new BigNumberInWei(position.margin)
    .toBase(market.quoteToken.decimals)
    .dividedBy(position.quantity)
  const isPositionLong = position.direction === TradeDirection.Long

  const bankruptcyPrice = isPositionLong
    ? price.minus(unitMargin)
    : price.plus(unitMargin)

  const minTickPrice = new BigNumberInBase(
    new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
  )

  const feeAdjustedBankruptcyPrice = isPositionLong
    ? bankruptcyPrice.dividedBy(
        new BigNumberInBase(1).minus(market.takerFeeRate)
      )
    : bankruptcyPrice.dividedBy(
        new BigNumberInBase(1).plus(market.takerFeeRate)
      )

  return feeAdjustedBankruptcyPrice.gte(0)
    ? feeAdjustedBankruptcyPrice
    : minTickPrice
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
  orderType: DerivativeOrderSide
  market: UiPerpetualMarketWithToken | UiExpiryFuturesMarketWithToken
}): BigNumberInBase => {
  if (!price || !quantity || !notionalWithLeverage) {
    return ZERO_IN_BASE
  }

  const isOrderTypeBuy = orderType === DerivativeOrderSide.Buy

  const numerator = isOrderTypeBuy
    ? new BigNumberInBase(notionalWithLeverage).minus(
        new BigNumberInBase(price).times(quantity)
      )
    : new BigNumberInBase(notionalWithLeverage).plus(
        new BigNumberInBase(price).times(quantity)
      )

  const maintenanceMarginRatioFactor = isOrderTypeBuy
    ? new BigNumberInBase(maintenanceMarginRatio).minus(1)
    : new BigNumberInBase(maintenanceMarginRatio)

  const denominator = isOrderTypeBuy
    ? maintenanceMarginRatioFactor.times(quantity)
    : maintenanceMarginRatioFactor.times(quantity).plus(quantity)

  const liquidationPrice = numerator.dividedBy(denominator)

  return liquidationPrice.gte(0) ? liquidationPrice : ZERO_IN_BASE
}

export const calculateWorstExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarketWithToken
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity)
    const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
    remainAmountToFill = remainAmountToFill.minus(min)

    if (remainAmountToFill.lte(0)) {
      return new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
    } else {
      worstPrice = new BigNumberInWei(record.price).toBase(
        market.quoteToken.decimals
      )
    }
  }

  return worstPrice
}

export const calculateWorstPriceUsingQuoteAmountAndOrderBookNonSwap = ({
  records,
  market,
  quoteAmount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarketWithToken
  quoteAmount: BigNumberInBase
}): BigNumberInBase => {
  let remainQuoteAmountToFill = quoteAmount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity)
    const orderPrice = new BigNumberInWei(record.price).toBase(
      market.quoteToken.decimals
    )

    const orderNotional = orderQuantity.times(orderPrice)

    const min = BigNumberInBase.min(remainQuoteAmountToFill, orderNotional)

    remainQuoteAmountToFill = remainQuoteAmountToFill.minus(min)

    if (remainQuoteAmountToFill.lte(0)) {
      return new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
    } else {
      worstPrice = new BigNumberInWei(record.price).toBase(
        market.quoteToken.decimals
      )
    }
  }

  return worstPrice
}

export const calculateAverageExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarketWithToken
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const min = BigNumberInBase.min(remainAmountToFill, order.quantity)
      const price = new BigNumberInWei(order.price).toBase(
        market.quoteToken.decimals
      )

      return {
        sum: sum.plus(price.times(min)),
        remainAmountToFill: remainAmountToFill.minus(min)
      }
    },
    { sum: ZERO_IN_BASE, remainAmountToFill: amount }
  )

  return sum.div(amount.minus(remainAmountToFill))
}

export const calculateAverageExecutionPriceFromFillableNotionalOnOrderBook = ({
  records,
  market,
  quoteAmount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarketWithToken
  quoteAmount: BigNumberInBase
}) => {
  const { amount, sum } = records.reduce(
    ({ amount, sum, remainNotionalToFill }, order: UiPriceLevel) => {
      const orderQuantity = new BigNumberInBase(order.quantity)

      const orderPrice = new BigNumberInBase(
        new BigNumberInWei(order.price).toBase(market.quoteToken.decimals)
      )

      const orderNotional = orderQuantity.times(orderPrice)
      const minNotional = BigNumberInBase.min(
        remainNotionalToFill,
        orderNotional
      )

      const additionalQuantity = orderQuantity.times(
        minNotional.div(orderNotional)
      )

      return {
        sum: remainNotionalToFill.gt(0)
          ? sum.plus(orderPrice.times(additionalQuantity))
          : sum,
        amount: amount.plus(additionalQuantity),
        remainNotionalToFill: remainNotionalToFill.minus(minNotional)
      }
    },
    {
      sum: ZERO_IN_BASE,
      amount: ZERO_IN_BASE,
      remainNotionalToFill: quoteAmount
    }
  )

  return sum.div(amount)
}

export const getApproxAmountForMarketOrder = ({
  records,
  margin,
  market,
  slippage,
  leverage = '1',
  percent = 1
}: {
  records: UiPriceLevel[]
  margin: BigNumberInBase
  percent?: number
  slippage: number
  leverage: string
  market: UiDerivativeMarketWithToken
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableMargin = new BigNumberInBase(margin).times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional: BigNumberInBase

  for (const record of records) {
    const price = new BigNumberInBase(
      new BigNumberInWei(record.price)
        .times(slippage)
        .toBase(market.quoteToken.decimals)
    )
    const quantity = new BigNumberInBase(
      new BigNumberInBase(record.quantity).dp(market.quantityDecimals)
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = new BigNumberInWei(totalNotional.times(fee))
    const totalMargin = calculateMargin({
      quantity: totalQuantity.toFixed(),
      price: price.toFixed(),
      leverage
    })
    const total = totalMargin.plus(totalFees)

    if (total.gt(availableMargin)) {
      return availableMargin
        .times(leverage)
        .dividedBy(fee.times(leverage).plus(1).times(price))
    }
  }

  return totalQuantity
}

export const getDerivativesMarketBaseAmountForPercentage = ({
  records,
  quoteAvailableBalance,
  market,
  slippage,
  leverage = '1',
  percent = 1
}: {
  records: UiPriceLevel[]
  quoteAvailableBalance: BigNumberInBase
  percent?: number
  slippage: number
  leverage: string
  market: UiDerivativeMarketWithToken
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableMargin = new BigNumberInBase(quoteAvailableBalance).times(
    percent
  )

  let totalQuantity = ZERO_IN_BASE
  let totalNotional: BigNumberInBase

  for (const record of records) {
    const price = new BigNumberInBase(
      new BigNumberInWei(record.price)
        .times(slippage)
        .toBase(market.quoteToken.decimals)
    )
    const quantity = new BigNumberInBase(
      new BigNumberInBase(record.quantity).dp(market.quantityDecimals)
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = new BigNumberInWei(totalNotional.times(fee))
    const totalMargin = calculateMargin({
      quantity: totalQuantity.toFixed(),
      price: price.toFixed(),
      leverage
    })
    const total = totalMargin.plus(totalFees)

    if (total.gt(availableMargin)) {
      return availableMargin
        .times(leverage)
        .dividedBy(fee.times(leverage).plus(1).times(price))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
    }
  }

  return formatAmountToAllowableDecimals(
    totalQuantity.toNumber(),
    market.quantityDecimals
  )
}

export const getDerivativesLimitBaseAmountForPercentage = ({
  records,
  quoteAvailableBalance,
  market,
  leverage = '1',
  percentageToNumber = 1,
  feeRate,
  executionPrice
}: {
  records: UiPriceLevel[]
  quoteAvailableBalance: BigNumberInBase
  percentageToNumber?: number
  leverage: string
  market: UiDerivativeMarketWithToken
  feeRate: BigNumberInBase
  executionPrice: BigNumberInBase
}) => {
  const availableMargin = new BigNumberInBase(quoteAvailableBalance).times(
    percentageToNumber
  )

  const { totalNotional, totalQuantity } = records.reduce(
    ({ totalNotional, totalQuantity }, { quantity, price }) => {
      const orderPrice = new BigNumberInBase(
        new BigNumberInWei(price).toBase(market.quoteToken.decimals)
      )
      const orderQuantity = new BigNumberInBase(
        new BigNumberInBase(quantity).dp(market.quantityDecimals)
      )

      return {
        totalQuantity: totalQuantity.plus(orderQuantity),
        totalNotional: totalNotional.plus(orderQuantity.times(orderPrice))
      }
    },
    { totalNotional: ZERO_IN_BASE, totalQuantity: ZERO_IN_BASE }
  )

  if (totalNotional.lte(availableMargin)) {
    return formatAmountToAllowableDecimals(
      totalQuantity.toNumber(),
      market.quantityDecimals
    )
  }

  const fee = new BigNumberInBase(feeRate)

  return new BigNumberInBase(availableMargin)
    .times(leverage)
    .dividedBy(executionPrice.times(fee.times(leverage).plus(1)))
    .times(percentageToNumber)
    .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
}

export const getDerivativesQuoteAmountForPercentageNonReduceOnly = ({
  percentageToNumber,
  quoteAvailableBalance,
  market,
  records,
  leverage,
  feeRate
}: {
  percentageToNumber: BigNumberInBase
  quoteAvailableBalance: BigNumberInBase
  market: UiDerivativeMarketWithToken
  records: UiPriceLevel[]
  leverage: string
  feeRate: BigNumberInBase
}) => {
  const totalNotional = records.reduce((totalNotional, { quantity, price }) => {
    const orderPrice = new BigNumberInBase(price).toWei(
      market.baseToken.decimals - market.quoteToken.decimals
    )

    const orderQuantity = new BigNumberInWei(quantity).toBase(
      market.baseToken.decimals
    )

    return totalNotional.plus(orderQuantity.times(orderPrice))
  }, ZERO_IN_BASE)

  const quoteBalanceByPercentage = new BigNumberInBase(
    quoteAvailableBalance
  ).times(percentageToNumber)

  if (totalNotional.lte(quoteBalanceByPercentage)) {
    return totalNotional
  }

  const quoteBalanceWithFeesAndLeverage = quoteBalanceByPercentage
    .div(new BigNumberInBase(1).plus(feeRate))
    .times(leverage)

  return quoteBalanceWithFeesAndLeverage
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

export const calculateBinaryOptionsMargin = ({
  quantity,
  price,
  orderSide
}: {
  quantity: string
  price: string
  orderSide: DerivativeOrderSide
}): BigNumberInBase => {
  if (orderSide === DerivativeOrderSide.Buy) {
    return new BigNumberInBase(quantity).times(price)
  }

  return new BigNumberInBase(quantity).times(
    new BigNumberInBase(1).minus(price)
  )
}

export const getApproxAmountForBinaryOptionsMarketOrder = ({
  records,
  margin,
  market,
  orderSide,
  slippage,
  leverage = 1,
  percent = 1
}: {
  records: UiPriceLevel[]
  margin: BigNumberInBase
  percent?: number
  slippage: number
  orderSide: DerivativeOrderSide
  leverage?: number | string
  market: UiBinaryOptionsMarketWithToken
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableMargin = new BigNumberInBase(margin).times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional = ZERO_IN_BASE

  for (const record of records) {
    const price = new BigNumberInBase(
      new BigNumberInWei(record.price)
        .times(slippage)
        .toBase(market.quoteToken.decimals)
    )
    const quantity = new BigNumberInBase(
      new BigNumberInBase(record.quantity).dp(market.quantityDecimals)
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = new BigNumberInWei(totalNotional.times(fee))
    const totalMargin = calculateBinaryOptionsMargin({
      quantity: totalQuantity.toFixed(),
      price: price.toFixed(),
      orderSide
    })
    const total = totalMargin.plus(totalFees)

    if (total.gt(availableMargin)) {
      return availableMargin
        .times(leverage)
        .dividedBy(fee.times(leverage).plus(1).times(price))
    }
  }

  return totalQuantity
}
