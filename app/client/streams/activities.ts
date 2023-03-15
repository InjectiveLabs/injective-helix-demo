import {
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  IndexerGrpcDerivativesStream,
  IndexerGrpcSpotStream,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback
} from '@injectivelabs/sdk-ts'
import { streamProvider } from '@/app/providers/StreamProvider'
import { StreamType } from '@/types'
import { ENDPOINTS } from '@/app/utils/constants'

export const spotMarketStream = new IndexerGrpcSpotStream(ENDPOINTS.indexer)
export const derivativesMarketStream = new IndexerGrpcDerivativesStream(
  ENDPOINTS.indexer
)

export const streamSubaccountSpotOrders = ({
  callback,
  subaccountId
}: {
  callback: SpotOrdersStreamCallback
  subaccountId: string
}) => {
  const streamFn = spotMarketStream.streamSpotOrders.bind(spotMarketStream)
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountOrders
  })
}

export const streamSubaccountSpotTrades = ({
  callback,
  subaccountId
}: {
  callback: SpotTradesStreamCallback
  subaccountId: string
}) => {
  const streamFn = spotMarketStream.streamSpotTrades.bind(spotMarketStream)
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.SpotSubaccountTrades
  })
}

export const streamSubaccountDerivativeOrders = ({
  callback,
  subaccountId
}: {
  callback: DerivativeOrdersStreamCallback
  subaccountId: string
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeOrders.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountOrders
  })
}

export const streamSubaccountDerivativeTrades = ({
  callback,
  subaccountId
}: {
  callback: DerivativeTradesStreamCallback
  subaccountId: string
}) => {
  const streamFn = derivativesMarketStream.streamDerivativeTrades.bind(
    derivativesMarketStream
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.DerivativesSubaccountTrades
  })
}
