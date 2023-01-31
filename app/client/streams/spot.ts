import {
  IndexerGrpcSpotStream,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback,
  SpotOrderbookStreamCallback,
  SpotOrderbookV2StreamCallback,
  SpotOrderHistoryStreamCallback,
} from '@injectivelabs/sdk-ts'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { ENDPOINTS } from '@/app/utils/constants'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'

export const spotMarketStream = new IndexerGrpcSpotStream(ENDPOINTS.indexer)

export const cancelOrderbookStream = () => {
  streamProvider.cancel(StreamType.SpotOrderbook)
}

export const cancelOrderbookV2Stream = () => {
  streamProvider.cancel(StreamType.SpotOrderbookV2)
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

export const streamOrderbook = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotOrderbookStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotOrderbook.bind(spotMarketStream)
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotOrderbook
  })
}

export const streamOrderbookV2 = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotOrderbookV2StreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotOrderbookV2.bind(spotMarketStream)
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotOrderbookV2
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
