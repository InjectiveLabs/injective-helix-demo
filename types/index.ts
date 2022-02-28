import {
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice
} from '@injectivelabs/ui-common'

export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
  keyCode?: number
}

export interface Constructable<T> {
  new (...args: any): T
}

export interface GeoLocation {
  continent: string
  country: string
}

export * from './enums'
export * from './env'
export * from './errors'
export * from './states'
