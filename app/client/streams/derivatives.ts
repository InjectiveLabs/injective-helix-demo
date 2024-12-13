import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  IndexerGrpcOracleStream,
  PositionsStreamCallback,
  IndexerGrpcDerivativesStream,
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  OraclePricesByMarketsStreamCallback,
  DerivativeOrderHistoryStreamCallback,
  DerivativeOrderbookUpdateStreamCallback
} from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@/app/utils/constants'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'

export const derivativesMarketStream = new IndexerGrpcDerivativesStream(
  ENDPOINTS.indexer
)

export const oracleStream = new IndexerGrpcOracleStream(ENDPOINTS.indexer)

export const cancelSubaccountPositionsStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountPositions)
}

export const cancelSubaccountTradesStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountTrades)
}

export const cancelSubaccountOrdersStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountOrders)
}

export const cancelSubaccountOrderHistoryStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountOrderHistory)
}

export const cancelOrderbookUpdateStream = () => {
  streamProvider.cancel(StreamType.DerivativesOrderbookUpdate)
}

export const cancelTradesStream = () => {
  streamProvider.cancel(StreamType.DerivativesTrades)
}

export const streamOrderbookUpdate = ({
  marketId,
  callback,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
  callback: DerivativeOrderbookUpdateStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderbookUpdate.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    callback,
    onResetCallback,
    marketIds: [marketId]
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesOrderbookUpdate
  })
}

export const streamTrades = ({
  marketId,
  callback,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
  callback: DerivativeTradesStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeTrades.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    callback,
    marketId,
    executionSide: TradeExecutionSide.Taker,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesTrades
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
  callback: DerivativeTradesStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeTrades.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(marketId && { marketId }),
    ...(subaccountId && { subaccountId }),
    ...(onResetCallback && { onResetCallback }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountTrades
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
  callback: DerivativeOrdersStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrders.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(marketId && { marketId }),
    ...(subaccountId && { subaccountId }),
    ...(onResetCallback && { onResetCallback }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountOrders
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
  callback: DerivativeOrderHistoryStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderHistory.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(marketId && { marketId }),
    ...(subaccountId && { subaccountId }),
    ...(onResetCallback && { onResetCallback }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountOrderHistory
  })
}

export const streamSubaccountPositions = ({
  marketId,
  address,
  callback,
  subaccountId,
  onResetCallback
}: {
  address?: string
  marketId?: string
  subaccountId?: string
  onResetCallback?: Function
  callback: PositionsStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativePositions.bind(
    derivativesMarketStream
  )

  const streamFnArgs = {
    ...(address && { address }),
    ...(marketId && { marketId }),
    ...(subaccountId && { subaccountId }),
    ...(onResetCallback && { onResetCallback }),
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountPositions
  })
}

export const streamMarketsMarkPrices = ({
  marketIds,
  callback,
  onResetCallback
}: {
  marketIds: string[]
  onResetCallback?: Function
  callback: OraclePricesByMarketsStreamCallback
}) => {
  const streamFn = oracleStream.streamOraclePricesByMarkets.bind(oracleStream)
  const streamFnArgs = {
    callback,
    marketIds,
    ...(onResetCallback && { onResetCallback })
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.OraclePrices
  })
}

export const cancelMarketsMarkPrices = () => {
  streamProvider.cancel(StreamType.OraclePrices)
}
