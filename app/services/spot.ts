import {
  SpotMarketStreamType,
  OrderbookStreamCallback as SpotMarketOrderbookStreamCallback,
  TradeStreamCallback as SpotMarketTradeStreamCallback,
  OrderStreamCallback as SpotMarketOrderStreamCallback
} from '@injectivelabs/spot-consumer'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import {
  UiOrderbookPriceLevel,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSpotMarketWithTokenMeta
} from '@injectivelabs/ui-common'
import { streamProvider } from '../providers/StreamProvider'
import { spotMarketStream } from '~/app/singletons/SpotMarketStream'

export const streamOrderbook = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotMarketOrderbookStreamCallback
}) => {
  const streamFn = spotMarketStream.orderbook.start.bind(
    spotMarketStream.orderbook
  )
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.Orderbook
  })
}

export const streamTrades = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.start.bind(spotMarketStream.trades)
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.Trades
  })
}

export const streamSubaccountTrades = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.subaccount.bind(
    spotMarketStream.trades
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountTrades
  })
}

export const streamSubaccountOrders = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: SpotMarketOrderStreamCallback
}) => {
  const streamFn = spotMarketStream.orders.subaccount.bind(
    spotMarketStream.orders
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountOrders
  })
}

export const cancelMarketStreams = () => {
  streamProvider.cancel(SpotMarketStreamType.Orderbook)
  streamProvider.cancel(SpotMarketStreamType.SubaccountOrders)
  streamProvider.cancel(SpotMarketStreamType.SubaccountTrades)
  streamProvider.cancel(SpotMarketStreamType.Trades)
  streamProvider.cancel(SubaccountStreamType.Balances)
}

export const calculateWorstExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarketWithTokenMeta
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )
    const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
    remainAmountToFill = remainAmountToFill.minus(min)

    if (remainAmountToFill.lte(0)) {
      return new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    } else {
      worstPrice = new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
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
  market: UiSpotMarketWithTokenMeta
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const orderQuantity = new BigNumberInWei(order.quantity).toBase(
        market.baseToken.decimals
      )
      const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
      const price = new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
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
  summary: { quantity: BigNumberInWei; total: BigNumberInBase },
  record: UiOrderbookPriceLevel
) => {
  return {
    quantity: summary.quantity.plus(new BigNumberInWei(record.quantity)),
    total: summary.total.plus(new BigNumberInBase(record.total || 0))
  }
}

export const getApproxAmountForMarketOrder = ({
  records,
  balance,
  market,
  slippage,
  percent = 1
}: {
  records: UiPriceLevel[]
  balance: BigNumberInBase
  percent?: number
  slippage: number
  market: UiSpotMarketWithTokenMeta
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableBalance = balance.times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional = ZERO_IN_BASE

  for (const record of records) {
    const price = new BigNumberInBase(record.price)
      .times(slippage)
      .toWei(market.baseToken.decimals - market.quoteToken.decimals)
    const quantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = totalNotional.times(fee)
    const total = totalNotional.plus(totalFees)

    if (total.gt(availableBalance)) {
      return availableBalance.dividedBy(fee.plus(1).times(price))
    }
  }

  return totalQuantity
}
