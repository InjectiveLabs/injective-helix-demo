import {
  SpotMarketStreamType,
  OrderbookStreamCallback as SpotMarketOrderbookStreamCallback,
  TradeStreamCallback as SpotMarketTradeStreamCallback,
  OrderStreamCallback as SpotMarketOrderStreamCallback
} from '@injectivelabs/spot-consumer'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
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
  marketId?: string
  subaccountId?: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.subaccount.bind(
    spotMarketStream.trades
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  marketId?: string
  subaccountId?: string
  callback: SpotMarketOrderStreamCallback
}) => {
  const streamFn = spotMarketStream.orders.subaccount.bind(
    spotMarketStream.orders
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountOrders
  })
}
