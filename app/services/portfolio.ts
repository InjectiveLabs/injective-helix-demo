import {
  DerivativeMarketStreamType,
  DerivativeTransformer,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  PositionStreamCallback
} from '@injectivelabs/derivatives-consumer'
import {
  SpotMarketComposer,
  SpotMarketStreamType,
  SpotTransformer,
  OrderStreamCallback as SpotMarketOrderStreamCallback
} from '@injectivelabs/spot-consumer'
import { Web3Exception } from '@injectivelabs/exceptions'
import { metricsProvider } from '../providers/MetricsProvider'
import { derivativeConsumer } from '../singletons/DerivativeMarketConsumer'
import { spotConsumer } from '../singletons/SpotMarketConsumer'
import { TxProvider } from '../providers/TxProvider'
import { CHAIN_ID } from '../utils/constants'
import { streamProvider } from '../providers/StreamProvider'
import { spotMarketStream } from '../singletons/SpotMarketStream'
import { derivativeMarketStream } from '../singletons/DerivativeMarketStream'
import { DerivativeOrderSide } from '~/types/derivatives'
import { SpotOrderSide } from '~/types/spot'
import { DerivativesMetrics, SpotMetrics } from '~/types/metrics'

export const fetchSubaccountOrders = async ({
  subaccountId,
  orderSide
}: {
  orderSide?: DerivativeOrderSide | SpotOrderSide
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

  const promiseForSpotOrders = spotConsumer.fetchOrders({
    orderSide: orderSide as SpotOrderSide,
    subaccountId
  })
  const spotOrders = await metricsProvider.sendAndRecord(
    promiseForSpotOrders,
    SpotMetrics.FetchOrders
  )

  return [
    ...DerivativeTransformer.grpcOrdersToOrders(derivativeOrders),
    ...SpotTransformer.grpcOrdersToOrders(spotOrders)
  ]
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

export const cancelOrder = async ({
  orderHash,
  address,
  marketId,
  injectiveAddress,
  subaccountId
}: {
  orderHash: string
  subaccountId: string
  marketId: string
  address: string
  injectiveAddress: string
}) => {
  const message = SpotMarketComposer.cancelSpotOrder({
    subaccountId,
    marketId,
    injectiveAddress,
    order: {
      orderHash
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: SpotMetrics.CancelLimitOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
}

export const batchCancelOrders = async ({
  orders,
  address,
  injectiveAddress
}: {
  orders: {
    subaccountId: string
    marketId: string
    orderHash: string
  }[]
  address: string
  injectiveAddress: string
}) => {
  const message = SpotMarketComposer.batchCancelSpotOrder({
    injectiveAddress,
    orders
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: SpotMetrics.BatchCancelLimitOrders,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
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

export const cancelPortfolioStreams = () => {
  streamProvider.cancel(DerivativeMarketStreamType.SubaccountOrders)
  streamProvider.cancel(DerivativeMarketStreamType.SubaccountPositions)
  streamProvider.cancel(SpotMarketStreamType.SubaccountOrders)
}
