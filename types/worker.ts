import { OrderbookWithSequence } from '@injectivelabs/sdk-ts'

export enum WorkerMessageType {
  Fetch = 'fetch',
  Stream = 'stream'
}

export type OrderbookWorkerMessage = {
  type: WorkerMessageType
  isSpot: boolean
  orderbook: OrderbookWithSequence
  baseDecimals: number
  quoteDecimals: number
  aggregation: number
}

export type OrderbookFormattedRecord = {
  price: string
  quantity: string
  volume: string
  totalVolume: string
}

export type OrderbookWorkerResult = {
  buys: any[]
  sells: any[]
}
