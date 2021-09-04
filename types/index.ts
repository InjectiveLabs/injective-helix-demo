export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
}

export interface Constructable<T> {
  new (...args: any): T
}

export interface UiOrderbookPriceLevel {
  price: string
  quantity: string
  timestamp: number
  oldQuantity?: string
  total: string
  depth: number
}

export interface UiPriceLevel {
  price: string
  quantity: string
  timestamp: number
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
