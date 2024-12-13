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
  callback,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
  callback: SpotOrderbookUpdateStreamCallback
}) => {
  const streamFn =
    spotMarketStream.streamSpotOrderbookUpdate.bind(spotMarketStream)
  const streamFnArgs = {
    marketIds: [marketId],
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotOrderbookUpdate
  })
}

export const streamTrades = ({
  marketId,
  callback,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
  callback: SpotTradesStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotTrades.bind(spotMarketStream)
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker,
    ...(onResetCallback && { onResetCallback })
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
  subaccountId,
  onResetCallback
}: {
  marketId?: string
  subaccountId?: string
  onResetCallback?: Function
  callback: SpotTradesStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotTrades.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback,
    ...(onResetCallback && { onResetCallback })
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
  subaccountId,
  onResetCallback
}: {
  marketId?: string
  subaccountId?: string
  onResetCallback?: Function
  callback: SpotOrdersStreamCallback
}) => {
  const streamFn = spotMarketStream.streamSpotOrders.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback,
    ...(onResetCallback && { onResetCallback })
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
  subaccountId,
  onResetCallback
}: {
  marketId?: string
  subaccountId?: string
  onResetCallback?: Function
  callback: SpotOrderHistoryStreamCallback
}) => {
  const streamFn =
    spotMarketStream.streamSpotOrderHistory.bind(spotMarketStream)
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
    callback,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountOrderHistory
  })
}
