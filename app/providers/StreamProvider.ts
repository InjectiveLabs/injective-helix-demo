/* eslint-disable no-console */
import type { StreamStatusResponse } from '@injectivelabs/ts-types'
import {
  oracleStream,
  derivativesMarketStream
} from '@/app/client/streams/derivatives'
import { portfolioStream } from '@/app/client/streams/bank'
import { spotMarketStream } from '@/app/client/streams/spot'
import { StreamType } from '@/types'

type StreamFn =
  | typeof oracleStream.streamOraclePrices
  | typeof spotMarketStream.streamSpotMarket
  | typeof spotMarketStream.streamSpotOrders
  | typeof spotMarketStream.streamSpotTrades
  | typeof spotMarketStream.streamSpotOrderbook
  | typeof spotMarketStream.streamSpotOrderHistory
  | typeof oracleStream.streamOraclePricesByMarkets
  | typeof spotMarketStream.streamSpotOrderbookUpdate
  | typeof derivativesMarketStream.streamDerivativeMarket
  | typeof derivativesMarketStream.streamDerivativeOrders
  | typeof derivativesMarketStream.streamDerivativeTrades
  | typeof derivativesMarketStream.streamDerivativeOrderbook
  | typeof derivativesMarketStream.streamDerivativePositions
  | typeof derivativesMarketStream.streamDerivativeOrderHistory
  | typeof derivativesMarketStream.streamDerivativeOrderbookUpdate
  | typeof portfolioStream.streamAccountPortfolio

type Stream = ReturnType<StreamFn>

const MAX_RECONNECTION = 10

/**
 * Every stream we extend with
 * an end and a status callback
 * that we can use how we deem fit.
 *
 * When there is an end callback,
 * we are reconnecting the stream
 * */
export class StreamProvider {
  private streamManager: Map<
    StreamType,
    { fn: Function; stream: Stream; args: any }
  >

  private reconnectCount: Record<string, number> = {}

  constructor() {
    this.streamManager = new Map()
  }

  subscribe({ fn, key, args }: { fn: StreamFn; key: StreamType; args: any }) {
    if (this.streamManager.has(key)) {
      return
    }

    const argsWithCallbacks = {
      ...args,
      onEndCallback: (status?: StreamStatusResponse): any => {
        if (this.getReconnectCount(key) <= MAX_RECONNECTION) {
          setTimeout(() => {
            this.reconnect(key)
            this.incrementReconnectCount(key)
          }, 1000)
        } else {
          console.error(status)
        }
      },
      onStatusCallback: (_status: StreamStatusResponse): any => {
        //
      }
    }
    const stream = fn(argsWithCallbacks)

    this.streamManager.set(key, {
      stream,
      fn,
      args: argsWithCallbacks
    })
  }

  cancel(key: StreamType) {
    if (!this.exists(key)) {
      return
    }

    this.streamManager.get(key)!.stream.unsubscribe()
    this.streamManager.delete(key)
  }

  cancelAll() {
    this.streamManager.forEach((stream) => {
      stream.stream.unsubscribe()
    })
    this.streamManager = new Map()
  }

  private reconnect(key: StreamType) {
    if (!this.exists(key)) {
      return
    }

    const { fn, args } = this.streamManager.get(key)!
    const newStream = fn(args)

    this.streamManager.set(key, {
      stream: newStream,
      fn,
      args
    })
  }

  private exists(key: StreamType) {
    return this.streamManager.has(key)
  }

  private getReconnectCount(key: string) {
    return this.reconnectCount[key] || 0
  }

  private incrementReconnectCount(key: string) {
    return (this.reconnectCount[key] = (this.reconnectCount[key] || 0) + 1)
  }
}

export const streamProvider = new StreamProvider()
