import { OrderbookWithSequence } from '@injectivelabs/sdk-ts'

export type OrderbookFormattedRecord = {
  price: string
  quantity: string
  volume: string
  totalVolume: string
  totalQuantity: string
  avgPrice: string
}

// Send Message

export enum WorkerMessageType {
  Fetch = 'fetch',
  Stream = 'stream',
  WorstPrice = 'worstPrice',
  Aggregation = 'aggregation'
}

type sendFetchOrStreamType = {
  type: WorkerMessageType.Fetch | WorkerMessageType.Stream
  data: {
    isSpot: boolean
    orderbook: OrderbookWithSequence
    baseDecimals: number
    quoteDecimals: number
    aggregation: number
    sequence: number
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

type sendAggregation = {
  type: WorkerMessageType.Aggregation
  data: {
    isSpot: boolean
    baseDecimals: number
    quoteDecimals: number
    aggregation: number
  }
}

export type OrderbookWorkerMessage =
  | sendFetchOrStreamType
  | sendWorstPriceType
  | sendAggregation

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
    highestBuyPrice: string
    lowestSellPrice: string
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
