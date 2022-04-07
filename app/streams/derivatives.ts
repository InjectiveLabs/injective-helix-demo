import {
  DerivativeMarketStreamType,
  OrderbookStreamCallback as DerivativeMarketOrderbookStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  PositionStreamCallback as DerivativeMarketPositionStreamCallback
} from '@injectivelabs/derivatives-consumer'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  OracleStreamType,
  PricesStreamCallback
} from '@injectivelabs/exchange-consumer'
import { UiBaseDerivativeMarket } from '@injectivelabs/ui-common'
import { oracleStream } from '../singletons/OracleStream'
import { streamProvider } from '../providers/StreamProvider'
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
  marketId?: string
  subaccountId?: string
  callback: DerivativeMarketTradeStreamCallback
}) => {
  const streamFn = derivativeMarketStream.trades.subaccount.bind(
    derivativeMarketStream.trades
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  marketId?: string
  subaccountId?: string
  callback: DerivativeMarketOrderStreamCallback
}) => {
  const streamFn = derivativeMarketStream.orders.subaccount.bind(
    derivativeMarketStream.orders
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountOrders
  })
}

export const streamSubaccountPositions = ({
  subaccountId,
  marketId,
  callback
}: {
  subaccountId?: string
  marketId?: string
  callback: DerivativeMarketPositionStreamCallback
}) => {
  const streamFn = derivativeMarketStream.positions.subaccount.bind(
    derivativeMarketStream.positions
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
