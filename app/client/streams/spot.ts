import {
  ExchangeGrpcSpotStream,
  SpotOrderbookStreamCallback,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback
} from '@injectivelabs/sdk-ts'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { streamProvider } from '../../providers/StreamProvider'
import { ENDPOINTS } from '~/app/utils/constants'
import { StreamType } from '~/types'

export const spotMarketStream = new ExchangeGrpcSpotStream(
  ENDPOINTS.exchangeApi
)

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
  subaccountId,
  callback
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
  subaccountId,
  callback
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
