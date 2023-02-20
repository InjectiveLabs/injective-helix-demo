import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  DerivativeOrderbookStreamCallback,
  DerivativeOrdersStreamCallback,
  DerivativeOrderHistoryStreamCallback,
  DerivativeTradesStreamCallback,
  IndexerGrpcDerivativesStream,
  IndexerGrpcOracleStream,
  OraclePricesByMarketsStreamCallback,
  PositionsStreamCallback
} from '@injectivelabs/sdk-ts'
import { streamProvider } from '../../providers/StreamProvider'
import { ENDPOINTS } from '@/app/utils/constants'
import { StreamType } from '@/types'

export const derivativesMarketStream = new IndexerGrpcDerivativesStream(
  ENDPOINTS.indexer
)

export const oracleStream = new IndexerGrpcOracleStream(ENDPOINTS.indexer)

export const streamOrderbook = ({
  marketId,
  callback
}: {
  marketId: string
  callback: DerivativeOrderbookStreamCallback
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrderbook.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    marketIds: [marketId],
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesOrderbook
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

export const cancelSubaccountTradesStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountTrades)
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

export const cancelSubaccountOrdersStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountOrders)
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

export const cancelSubaccountOrderHistoryStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountOrderHistory)
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

export const cancelSubaccountPositionsStream = () => {
  streamProvider.cancel(StreamType.DerivativesSubaccountPositions)
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
