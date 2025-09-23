import type { OrderbookWithSequence } from '@injectivelabs/sdk-ts'

export interface OrderbookWorkerType extends Omit<Worker, 'postMessage'> {
  postMessage(message: OrderbookWorkerMessage): void
}

export type OrderbookFormattedRecord = {
  price: string
  volume: string
  quantity: string
  avgPrice: string
  totalVolume: string
  totalQuantity: string
}

// Send Message

export enum WorkerMessageType {
  Fetch = 'fetch',
  Stream = 'stream',
  Quantity = 'quantity',
  Notional = 'notional',
  Aggregation = 'aggregation'
}

type sendFetchOrStreamType = {
  type: WorkerMessageType.Fetch | WorkerMessageType.Stream
  data: {
    isSpot: boolean
    sequence: number
    aggregation: number
    baseDecimals: number
    quoteDecimals: number
    orderbook: OrderbookWithSequence
  }
}

type sendQuantityType = {
  type: WorkerMessageType.Quantity
  data: {
    isBuy: boolean
    isSpot: boolean
    quantity: string
    baseDecimals: number
    quoteDecimals: number
  }
}

type sendNotionalType = {
  type: WorkerMessageType.Notional
  data: {
    isBuy: boolean
    isSpot: boolean
    notional: string
    baseDecimals: number
    quoteDecimals: number
  }
}

type sendAggregation = {
  type: WorkerMessageType.Aggregation
  data: {
    isSpot: boolean
    aggregation: number
    baseDecimals: number
    quoteDecimals: number
  }
}

export type OrderbookWorkerMessage =
  | sendAggregation
  | sendQuantityType
  | sendNotionalType
  | sendFetchOrStreamType

// Receive Message

export enum WorkerMessageResponseType {
  ReplaceOrderbook = 'replaceOrderbook',
  RefetchOrderbook = 'refetchOrderbook',
  ReceiveQuantityInfo = 'receiveQuantityInfo',
  ReceiveNotionalInfo = 'receiveNotionalInfo'
}

type ReplaceOrderbookType = {
  messageType: WorkerMessageResponseType.ReplaceOrderbook
  data: {
    buys: any[]
    sells: any[]
    highestBuyPrice: string
    lowestSellPrice: string
  }
}

type RefetchOrderbookType = {
  data: undefined
  messageType: WorkerMessageResponseType.RefetchOrderbook
}

type ReceiveQuantityInfoType = {
  messageType: WorkerMessageResponseType.ReceiveQuantityInfo
  data: {
    bestPrice: string
    worstPrice: string
    averagePrice: string
    enoughLiquidity: boolean
  }
}

type ReceiveNotionalInfoType = {
  messageType: WorkerMessageResponseType.ReceiveNotionalInfo
  data: {
    quantity: string
    bestPrice: string
    worstPrice: string
    averagePrice: string
    enoughLiquidity: boolean
  }
}

export type OrderbookWorkerResult =
  | ReplaceOrderbookType
  | RefetchOrderbookType
  | ReceiveQuantityInfoType
  | ReceiveNotionalInfoType
