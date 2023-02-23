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

export const streamOrderbookUpdate = ({
  marketId,
  callback
}: {
  marketId: string
  callback: DerivativeOrderbookUpdateStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderbookUpdate.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesOrderbookUpdate
  })
}

export const streamTrades = ({
  marketId,
  callback
}: {
  marketId: string
  callback: DerivativeTradesStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeTrades.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
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
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: DerivativeTradesStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeTrades.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: DerivativeOrdersStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrders.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  subaccountId
}: {
  marketId?: string
  subaccountId?: string
  callback: DerivativeOrderHistoryStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderHistory.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  callback,
  subaccountId
}: {
  subaccountId?: string
  marketId?: string
  callback: PositionsStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativePositions.bind(
    derivativesMarketStream
  )

  const streamFnArgs = {
    ...(subaccountId && { subaccountId }),
    ...(marketId && { marketId }),
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
  callback
}: {
  marketIds: string[]
  callback: OraclePricesByMarketsStreamCallback
}) => {
  const streamFn = oracleStream.streamOraclePricesByMarkets.bind(oracleStream)
  const streamFnArgs = { marketIds, callback }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.OraclePrices
  })
}

export const cancelMarketsMarkPrices = () => {
  streamProvider.cancel(StreamType.OraclePrices)
}
