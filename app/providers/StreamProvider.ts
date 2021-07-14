import { DerivativeMarketStreamType } from '@injectivelabs/derivatives-consumer'
import { OracleStreamType } from '@injectivelabs/exchange-consumer'
import { SpotMarketStreamType } from '@injectivelabs/spot-consumer'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'

type StreamKey =
  | SubaccountStreamType
  | DerivativeMarketStreamType
  | SpotMarketStreamType
  | OracleStreamType

/**
 * WiP
 **/
export class StreamProvider {
  private streamManager: Map<StreamKey, { streamFn: Function; stream: any }>

  constructor() {
    this.streamManager = new Map()
  }

  subscribe<T extends Function>({
    streamFn,
    streamKey
  }: {
    streamFn: T
    streamKey: StreamKey
  }) {
    if (this.streamManager.has(SubaccountStreamType.Balances)) {
      return
    }

    const streamFnWithEndCallback = streamFn.bind(this, {
      ...streamFn.arguments,
      onEndCallback: () => {
        this.reconnect(streamKey)
      }
    })

    const stream = streamFnWithEndCallback()

    this.streamManager.set(streamKey, {
      stream,
      streamFn: streamFnWithEndCallback
    })
  }

  private reconnect(streamKey: StreamKey) {
    if (!this.streamManager.has(SubaccountStreamType.Balances)) {
      return
    }

    const { streamFn } = this.streamManager.get(streamKey)!
    const newStream = streamFn()

    this.streamManager.set(streamKey, {
      stream: newStream,
      streamFn
    })
  }
}
