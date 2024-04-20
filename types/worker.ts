import { OrderbookWithSequence } from '@injectivelabs/sdk-ts'

export type OrderbookFormattedRecord = {
  price: string
  quantity: string
  volume: string
  totalVolume: string
}

// Send Message

export enum WorkerMessageType {
  Fetch = 'fetch',
  Stream = 'stream',
  WorstPrice = 'worstPrice'
}

type sendFetchOrStreamType = {
  type: WorkerMessageType.Fetch | WorkerMessageType.Stream
  data: {
    isSpot: boolean
    orderbook: OrderbookWithSequence
    baseDecimals: number
    quoteDecimals: number
    aggregation: number
  }
}

type sendWorstPriceType = {
  type: WorkerMessageType.WorstPrice
  data: {
    isSpot: boolean
    isBuy: boolean
    baseDecimals: number
    quoteDecimals: number
    quantity: string
  }
}

export type OrderbookWorkerMessage = sendFetchOrStreamType | sendWorstPriceType

// Receive Message

export enum WorkerMessageResponseType {
  ReplaceOrderbook = 'replaceOrderbook',
  RefetchOrderbook = 'refetchOrderbook',
  WorstPrice = 'worstPrice'
}

type ReplaceOrderbookType = {
  messageType: WorkerMessageResponseType.ReplaceOrderbook
  data: {
    buys: any[]
    sells: any[]
  }
}

type RefetchOrderbookType = {
  messageType: WorkerMessageResponseType.RefetchOrderbook
  data: undefined
}

type WorstPriceType = {
  messageType: WorkerMessageResponseType.WorstPrice
  data: {
    worstPrice: string
  }
}

export type OrderbookWorkerResult =
  | ReplaceOrderbookType
  | RefetchOrderbookType
  | WorstPriceType
