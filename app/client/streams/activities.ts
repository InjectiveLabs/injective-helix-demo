import {
<<<<<<< HEAD
  IndexerGrpcDerivativesStream,
  IndexerGrpcSpotStream,
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback
} from '@injectivelabs/sdk-ts'

=======
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  IndexerGrpcDerivativesStream,
  IndexerGrpcSpotStream,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback
} from '@injectivelabs/sdk-ts'
>>>>>>> helix/master
import { streamProvider } from '../../providers/StreamProvider'
import { StreamType } from '~/types'
import { ENDPOINTS } from '~/app/utils/constants'

<<<<<<< HEAD
export const spotMarketStream = new IndexerGrpcSpotStream(ENDPOINTS.exchangeApi)
export const derivativesMarketStream = new IndexerGrpcDerivativesStream(
  ENDPOINTS.exchangeApi
=======
export const spotMarketStream = new IndexerGrpcSpotStream(ENDPOINTS.indexerApi)
export const derivativesMarketStream = new IndexerGrpcDerivativesStream(
  ENDPOINTS.indexerApi
>>>>>>> helix/master
)

export const streamSubaccountSpotOrders = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SpotOrdersStreamCallback
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
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SpotTradesStreamCallback
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
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: DerivativeOrdersStreamCallback
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
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: DerivativeTradesStreamCallback
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
