import {
  IndexerGrpcSpotStream,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback,
  SpotOrderHistoryStreamCallback,
  SpotOrderbookUpdateStreamCallback
} from '@injectivelabs/sdk-ts'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { ENDPOINTS } from '@/app/utils/constants'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'

export const spotMarketStream = new IndexerGrpcSpotStream(ENDPOINTS.indexer)

export const cancelOrderbookUpdateStream = () => {
  streamProvider.cancel(StreamType.SpotOrderbookUpdate)
}

export const cancelTradesStream = () => {
  streamProvider.cancel(StreamType.SpotTrades)
}

export const cancelSubaccountOrdersStream = () => {
  streamProvider.cancel(StreamType.SpotSubaccountOrders)
}

export const cancelSubaccountOrdersHistoryStream = () => {
  streamProvider.cancel(StreamType.SpotSubaccountOrderHistory)
}

export const cancelSubaccountTradesStream = () => {
  streamProvider.cancel(StreamType.SpotSubaccountTrades)
}

export const streamOrderbookUpdate = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotOrderbookUpdateStreamCallback
}) => {
  const streamFn =
    spotMarketStream.streamSpotOrderbookUpdate.bind(spotMarketStream)
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotOrderbookUpdate
  })
}

export const streamTrades = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotTradesStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotTrades.bind(spotMarketStream)
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotTrades
  })
}

export const streamSubaccountTrades = ({
  marketId,
  callback,
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: SpotTradesStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotTrades.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountTrades
  })
}

export const streamSubaccountOrders = ({
  marketId,
  callback,
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: SpotOrdersStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotOrders.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountOrders
  })
}

export const streamSubaccountOrderHistory = ({
  marketId,
  callback,
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: SpotOrderHistoryStreamCallback
}) => {
  const streamFn =
    spotMarketStream.streamSpotOrderHistory.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountOrderHistory
  })
}
