import {
  DerivativeMarketStreamType,
  StreamStatusResponse
} from '@injectivelabs/derivatives-consumer'
import { OracleStreamType } from '@injectivelabs/exchange-consumer'
import { SpotMarketStreamType } from '@injectivelabs/spot-consumer'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import { oracleStream } from '../singletons/OracleStream'
import { subaccountStream } from '../singletons/SubaccountStream'
import { derivativeMarketStream } from '~/app/singletons/DerivativeMarketStream'
import { spotMarketStream } from '~/app/singletons/SpotMarketStream'

type StreamKey =
  | SubaccountStreamType
  | DerivativeMarketStreamType
  | SpotMarketStreamType
  | OracleStreamType

type StreamFn =
  | typeof derivativeMarketStream.orderbook.start
  | typeof derivativeMarketStream.orders.start
  | typeof derivativeMarketStream.orders.subaccount
  | typeof derivativeMarketStream.positions.start
  | typeof derivativeMarketStream.positions.subaccount
  | typeof derivativeMarketStream.trades.start
  | typeof derivativeMarketStream.trades.subaccount
  | typeof spotMarketStream.orderbook.start
  | typeof spotMarketStream.orders.start
  | typeof spotMarketStream.orders.subaccount
  | typeof spotMarketStream.trades.start
  | typeof spotMarketStream.trades.subaccount
  | typeof subaccountStream.balances.start
  | typeof oracleStream.prices.start

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
    StreamKey,
    { fn: Function; stream: Stream; args: any }
  >

  constructor() {
    this.streamManager = new Map()
  }

  subscribe({ fn, key, args }: { fn: StreamFn; key: StreamKey; args: any }) {
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

  cancel(key: StreamKey) {
    if (!this.exists(key)) {
      return
    }

    this.streamManager.get(key)!.stream.cancel()
    this.streamManager.delete(key)
  }

  private reconnect(key: StreamKey) {
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

  private exists(key: StreamKey) {
    return this.streamManager.has(key)
  }
}

export const streamProvider = new StreamProvider()
