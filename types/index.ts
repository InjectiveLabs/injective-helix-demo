import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
}

export interface Constructable<T> {
  new (...args: any): T
}

export interface UiOrderbookPriceLevel {
  price: string
  quantity: BigNumberInWei
  timestamp: number
  oldQuantity?: string
  total: BigNumberInBase
  depth: number
  aggregatePrices?: string[]
  aggregatedPrice?: string
}

export interface UiOrderbookSummary {
  quantity: BigNumberInBase
  total: BigNumberInBase
}

export interface UiPriceLevel {
  price: string
  quantity: BigNumberInWei | string
  timestamp: number
  aggregatePrices?: string[]
}

export interface GeoLocation {
  continent: string
  country: string
}

export * from './aliases'
export * from './enums'
export * from './env'
export * from './bank'
export * from './errors'
export * from './gas'
export * from './spot'
export * from './derivatives'
export * from './subaccount'
export * from './states'
export * from './token'
export * from './gasRebate'
