export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
}

export interface Constructable<T> {
  new (...args: any): T
}

export * from './aliases'
export * from './enums'
export * from './env'
export * from './errors'
export * from './gas'
export * from './spot'
export * from './subaccount'
export * from './states'
export * from './token'
