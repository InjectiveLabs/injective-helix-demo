import {
  DerivativeMarketStreamType,
  DerivativeTransformer,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  PositionStreamCallback
} from '@injectivelabs/derivatives-consumer'
import {
  SpotMarketStreamType,
  SpotTransformer,
  OrderStreamCallback as SpotMarketOrderStreamCallback,
  TradeStreamCallback as SpotMarketTradeStreamCallback
} from '@injectivelabs/spot-consumer'
import { metricsProvider } from '../providers/MetricsProvider'
import { derivativeConsumer } from '../singletons/DerivativeMarketConsumer'
import { spotConsumer } from '../singletons/SpotMarketConsumer'
import { streamProvider } from '../providers/StreamProvider'
import { spotMarketStream } from '../singletons/SpotMarketStream'
import { derivativeMarketStream } from '../singletons/DerivativeMarketStream'
import { DerivativeOrderSide, UiDerivativeOrderbook } from '~/types/derivatives'
import { SpotOrderSide } from '~/types/spot'
import { DerivativesMetrics, SpotMetrics } from '~/types/metrics'

export const fetchSubaccountDerivativeOrders = async ({
  subaccountId,
  orderSide
}: {
  orderSide?: DerivativeOrderSide
  subaccountId: string
}) => {
  const promiseForDerivativeOrders = derivativeConsumer.fetchOrders({
    orderSide: orderSide as DerivativeOrderSide,
    subaccountId
  })
  const derivativeOrders = await metricsProvider.sendAndRecord(
    promiseForDerivativeOrders,
    DerivativesMetrics.FetchOrders
  )

  return DerivativeTransformer.grpcOrdersToOrders(derivativeOrders)
}

export const fetchSubaccountSpotTrades = async ({
  subaccountId
}: {
  orderSide?: SpotOrderSide
  subaccountId: string
}) => {
  const promiseForSpotTrades = spotConsumer.fetchTrades({
    subaccountId
  })
  const spotTrades = await metricsProvider.sendAndRecord(
    promiseForSpotTrades,
    SpotMetrics.FetchTrades
  )

  return SpotTransformer.grpcTradesToTrades(spotTrades)
}

export const fetchSubaccountDerivativeTrades = async ({
  subaccountId
}: {
  orderSide?: SpotOrderSide
  subaccountId: string
}) => {
  const promiseForDerivativeTrades = derivativeConsumer.fetchTrades({
    subaccountId
  })
  const derivativeTrades = await metricsProvider.sendAndRecord(
    promiseForDerivativeTrades,
    DerivativesMetrics.FetchTrades
  )

  return DerivativeTransformer.grpcTradesToTrades(derivativeTrades)
}

export const fetchSubaccountSpotOrders = async ({
  subaccountId,
  orderSide
}: {
  orderSide?: SpotOrderSide
  subaccountId: string
}) => {
  const promiseForSpotOrders = spotConsumer.fetchOrders({
    orderSide: orderSide as SpotOrderSide,
    subaccountId
  })
  const spotOrders = await metricsProvider.sendAndRecord(
    promiseForSpotOrders,
    SpotMetrics.FetchOrders
  )

  return SpotTransformer.grpcOrdersToOrders(spotOrders)
}

export const fetchSubaccountPositions = async ({
  subaccountId
}: {
  subaccountId?: string
}) => {
  const promise = derivativeConsumer.fetchPositions({
    subaccountId
  })
  const positions = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchPositions
  )

  return DerivativeTransformer.grpcPositionsToPositions(positions)
}

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
