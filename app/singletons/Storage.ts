import { LocalStorage } from '@injectivelabs/utils'

export const localStorage: LocalStorage = new LocalStorage(
  `inj-dex-v8-${process.env.APP_ENV || 'dex'}`
)
