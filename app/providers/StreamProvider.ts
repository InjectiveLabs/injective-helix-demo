/* eslint-disable no-console */
import { differenceInSeconds } from 'date-fns'
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
  | typeof portfolioStream.streamAccountPortfolio
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

type Stream = ReturnType<StreamFn>

const GRPC_ERROR_CODES = {
  UNKNOWN: 2,
  DEADLINE_EXCEEDED: 4
}

const MAX_RECONNECTION = 2

const DEFAULT_REFRESH_INTERVAL = 30

const streamRefreshInterval: Partial<Record<StreamType, number>> = {
  [StreamType.BankBalance]: 60,
  [StreamType.SubaccountBalances]: 60
}

/**
 * Every stream we extend with
 * an end and a status callback
 * that we can use how we deem fit.
 *
 * When there is an end callback,
 * we are reconnecting the stream
 * */
export class StreamProvider {
  public streamManager: Map<
    StreamType,
    { fn: Function; stream: Stream; args: any; updatedAt: number }
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
      callback: (data: any) => {
        const existingStream = this.streamManager.get(key)

        if (existingStream) {
          this.streamManager.set(key, {
            ...existingStream,
            updatedAt: Date.now()
          })
        }

        args.callback(data)
      },
      onEndCallback: (status: StreamStatusResponse): any => {
        this.reconnectOnTimeout(key, status)
      },
      onStatusCallback: (status: StreamStatusResponse): any => {
        if (
          Object.values(GRPC_ERROR_CODES).includes(status.code) &&
          this.getReconnectCount(key) <= MAX_RECONNECTION
        ) {
          this.reconnect(key)
          this.incrementReconnectCount(key)
        }
      }
    }
    const stream = fn(argsWithCallbacks)

    this.streamManager.set(key, {
      stream,
      fn,
      args: argsWithCallbacks,
      updatedAt: Date.now()
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
    const { fn, args } = this.streamManager.get(key)!

    this.cancel(key)

    if (args.onResetCallback) {
      args.onResetCallback()
    }

    this.streamManager.set(key, {
      stream: fn(args),
      fn,
      args,
      updatedAt: Date.now()
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

  private reconnectOnTimeout(key: StreamType, status?: StreamStatusResponse) {
    if (this.getReconnectCount(key) <= MAX_RECONNECTION) {
      setTimeout(() => {
        this.reconnect(key)
        this.incrementReconnectCount(key)
      }, 1000)
    } else if (status) {
      console.error(JSON.stringify({ status }))
    }
  }

  public healthCheck() {
    this.streamManager.keys().forEach((key) => {
      const stream = this.streamManager.get(key)

      if (stream) {
        const inactiveTimeInSeconds = differenceInSeconds(
          new Date(),
          stream.updatedAt
        )
        const refreshInterval =
          streamRefreshInterval[key] || DEFAULT_REFRESH_INTERVAL

        if (inactiveTimeInSeconds >= refreshInterval) {
          this.reconnect(key)
        }
      }
    })
  }
}

export const streamProvider = new StreamProvider()
