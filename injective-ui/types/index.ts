export * from './enum'
export * from './json'
export * from './token'
export * from './trade'
export * from './shared'
export * from './market'
export * from './bridge'
export * from './wallet'
export * from './explorer'
export * from './coinGecko'
export * from './validator'

export interface PasteEvent<T extends EventTarget> extends ClipboardEvent {
  target: T
}

export interface KeydownEvent<T extends EventTarget> extends KeyboardEvent {
  target: T
}
