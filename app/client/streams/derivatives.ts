import { TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  DerivativeOrderbookStreamCallback,
  DerivativeOrdersStreamCallback,
  DerivativeTradesStreamCallback,
  ExchangeGrpcDerivativesStream,
  ExchangeGrpcOracleStream,
  OraclePriceStreamCallback,
  PositionsStreamCallback
} from '@injectivelabs/sdk-ts'
import {
  MarketType,
  UiBinaryOptionsMarketWithToken,
  UiDerivativeMarketWithToken,
  UiPerpetualMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { streamProvider } from '../../providers/StreamProvider'
import { ENDPOINTS } from '~/app/utils/constants'
import { StreamType } from '~/types'

export const derivativesMarketStream = new ExchangeGrpcDerivativesStream(
  ENDPOINTS.exchangeApi
)
export const oracleStream = new ExchangeGrpcOracleStream(ENDPOINTS.exchangeApi)
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
  subaccountId,
  callback
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
  subaccountId,
  callback
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

export const streamSubaccountPositions = ({
  subaccountId,
  marketId,
  callback
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

export const streamMarketMarkPrice = ({
  market,
  callback
}: {
  market: UiDerivativeMarketWithToken
  callback: OraclePriceStreamCallback
}) => {
  const streamFn = oracleStream.streamOraclePrices.bind(oracleStream)
  const streamFnArgs =
    market.subType === MarketType.BinaryOptions
      ? {
          baseSymbol: (market as UiPerpetualMarketWithToken).oracleBase,
          quoteSymbol: (market as UiPerpetualMarketWithToken).oracleQuote,
          oracleType: market.oracleType,
          callback
        }
      : {
          oracleType: market.oracleType,
          baseSymbol: (market as UiBinaryOptionsMarketWithToken).oracleSymbol,
          quoteSymbol: (market as UiBinaryOptionsMarketWithToken)
            .oracleProvider,
          callback
        }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: StreamType.OraclePrices
  })
}
