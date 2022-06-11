import {
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  ExchangeGrpcDerivativesStream,
  ExchangeGrpcSpotStream,
  SpotOrdersStreamCallback,
  SpotTradesStreamCallback
} from '@injectivelabs/sdk-ts'
import { streamProvider } from '../../providers/StreamProvider'
import { StreamType } from '~/types'
import { ENDPOINTS } from '~/app/utils/constants'

export const spotMarketStream = new ExchangeGrpcSpotStream(
  ENDPOINTS.exchangeApi
)
export const derivativesMarketStream = new ExchangeGrpcDerivativesStream(
  ENDPOINTS.exchangeApi
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
