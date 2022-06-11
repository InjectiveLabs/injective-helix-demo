import { StreamStatusResponse } from '@injectivelabs/ts-types'
import { subaccountStream } from '../client/streams/account'
import { spotMarketStream } from '../client/streams/spot'
import {
  derivativesMarketStream,
  oracleStream
} from '../client/streams/derivatives'
import { StreamType } from '~/types'

type StreamFn =
  | typeof derivativesMarketStream.streamDerivativeMarket
  | typeof derivativesMarketStream.streamDerivativeOrderbook
  | typeof derivativesMarketStream.streamDerivativeOrders
  | typeof derivativesMarketStream.streamDerivativePositions
  | typeof derivativesMarketStream.streamDerivativeTrades
  | typeof spotMarketStream.streamSpotOrderbook
  | typeof spotMarketStream.streamSpotMarket
  | typeof spotMarketStream.streamSpotOrders
  | typeof spotMarketStream.streamSpotTrades
  | typeof oracleStream.streamOraclePrices
  | typeof subaccountStream.streamSubaccountBalance

type Stream = ReturnType<StreamFn>

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

  constructor() {
    this.streamManager = new Map()
  }

  subscribe({ fn, key, args }: { fn: StreamFn; key: StreamType; args: any }) {
    if (this.streamManager.has(key)) {
      return
    }

    const argsWithCallbacks = {
      ...args,
      onEndCallback: (_status?: StreamStatusResponse): any => {
        setTimeout(() => {
          this.reconnect(key)
        }, 1000)
      },
      onStatusCallback: (_status: StreamStatusResponse): any => {}
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

    this.streamManager.get(key)!.stream.cancel()
    this.streamManager.delete(key)
  }

  cancelAll() {
    this.streamManager.forEach((stream) => {
      stream.stream.cancel()
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
}

export const streamProvider = new StreamProvider()
