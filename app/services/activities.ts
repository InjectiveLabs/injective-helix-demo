import {
  DerivativeMarketStreamType,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  PositionStreamCallback
} from '@injectivelabs/derivatives-consumer'
import {
  SpotMarketStreamType,
  OrderStreamCallback as SpotMarketOrderStreamCallback,
  TradeStreamCallback as SpotMarketTradeStreamCallback
} from '@injectivelabs/spot-consumer'
import { streamProvider } from '../providers/StreamProvider'
import { spotMarketStream } from '../singletons/SpotMarketStream'
import { derivativeMarketStream } from '../singletons/DerivativeMarketStream'

export const streamSubaccountSpotOrders = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SpotMarketOrderStreamCallback
}) => {
  const streamFn = spotMarketStream.orders.subaccount.bind(
    spotMarketStream.orders
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountOrders
  })
}

export const streamSubaccountSpotTrades = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.subaccount.bind(
    spotMarketStream.trades
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountTrades
  })
}

export const streamSubaccountDerivativeOrders = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: DerivativeMarketOrderStreamCallback
}) => {
  const streamFn = derivativeMarketStream.orders.subaccount.bind(
    derivativeMarketStream.orders
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountOrders
  })
}

export const streamSubaccountDerivativeTrades = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: DerivativeMarketTradeStreamCallback
}) => {
  const streamFn = derivativeMarketStream.trades.subaccount.bind(
    derivativeMarketStream.trades
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountTrades
  })
}

export const streamSubaccountPositions = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: PositionStreamCallback
}) => {
  const streamFn = derivativeMarketStream.positions.subaccount.bind(
    derivativeMarketStream.positions
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: DerivativeMarketStreamType.SubaccountPositions
  })
}
