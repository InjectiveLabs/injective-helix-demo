import {
  DerivativeMarketStreamType,
  DerivativeOrderSide,
  OrderbookStreamCallback as DerivativeMarketOrderbookStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  PositionStreamCallback as DerivativeMarketPositionStreamCallback
} from '@injectivelabs/derivatives-consumer'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import {
  OracleStreamType,
  PricesStreamCallback
} from '@injectivelabs/exchange-consumer'
import {
  TradeDirection,
  UiBaseDerivativeMarket,
  UiDerivativeMarketWithTokenMeta,
  UiPosition
} from '@injectivelabs/ui-common/dist/derivative/types'
import {
  UiOrderbookPriceLevel,
  UiPriceLevel
} from '@injectivelabs/ui-common/dist/types'
import { oracleStream } from '../singletons/OracleStream'
import { streamProvider } from '../providers/StreamProvider'
import { ZERO_IN_BASE } from '../utils/constants'
import { derivativeMarketStream } from '~/app/singletons/DerivativeMarketStream'

export const streamOrderbook = ({
  marketId,
  callback
}: {
  marketId: string
  callback: DerivativeMarketOrderbookStreamCallback
}) => {
  const streamFn = derivativeMarketStream.orderbook.start.bind(
    derivativeMarketStream.orderbook
  )
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.Orderbook
  })
}

export const streamTrades = ({
  marketId,
  callback
}: {
  marketId: string
  callback: DerivativeMarketTradeStreamCallback
}) => {
  const streamFn = derivativeMarketStream.trades.start.bind(
    derivativeMarketStream.trades
  )
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.Trades
  })
}

export const streamSubaccountTrades = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketTradeStreamCallback
}) => {
  const streamFn = derivativeMarketStream.trades.subaccount.bind(
    derivativeMarketStream.trades
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountTrades
  })
}

export const streamSubaccountOrders = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketOrderStreamCallback
}) => {
  const streamFn = derivativeMarketStream.orders.subaccount.bind(
    derivativeMarketStream.orders
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountOrders
  })
}

export const streamSubaccountPositions = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketPositionStreamCallback
}) => {
  const streamFn = derivativeMarketStream.positions.subaccount.bind(
    derivativeMarketStream.positions
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountPositions
  })
}

export const streamMarketMarkPrice = ({
  market,
  callback
}: {
  market: UiBaseDerivativeMarket
  callback: PricesStreamCallback
}) => {
  const streamFn = oracleStream.prices.start.bind(oracleStream.prices)
  const streamFnArgs = {
    oracleType: market.oracleType,
    baseSymbol: market.oracleBase,
    quoteSymbol: market.oracleQuote,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: OracleStreamType.Prices
  })
}

export const cancelMarketStreams = () => {
  streamProvider.cancel(DerivativeMarketStreamType.Orderbook)
  streamProvider.cancel(DerivativeMarketStreamType.SubaccountOrders)
  streamProvider.cancel(DerivativeMarketStreamType.SubaccountTrades)
  streamProvider.cancel(DerivativeMarketStreamType.SubaccountPositions)
  streamProvider.cancel(DerivativeMarketStreamType.Trades)
  streamProvider.cancel(SubaccountStreamType.Balances)
  streamProvider.cancel(OracleStreamType.Prices)
}

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
  market: UiDerivativeMarketWithTokenMeta
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
  margin,
  orderType,
  market: { maintenanceMarginRatio }
}: {
  price: string
  quantity: string
  margin: string
  orderType: DerivativeOrderSide
  market: UiBaseDerivativeMarket
}): BigNumberInBase => {
  if (!price || !quantity || !margin) {
    return ZERO_IN_BASE
  }

  const isOrderTypeBuy = orderType === DerivativeOrderSide.Buy

  const numerator = isOrderTypeBuy
    ? new BigNumberInBase(margin).minus(
        new BigNumberInBase(price).times(quantity)
      )
    : new BigNumberInBase(margin).plus(
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
  market: UiDerivativeMarketWithTokenMeta
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

export const calculateAverageExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarketWithTokenMeta
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
  market: UiDerivativeMarketWithTokenMeta
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
