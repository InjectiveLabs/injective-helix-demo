import { LocalStorage } from '@injectivelabs/utils'

export const localStorage: LocalStorage = new LocalStorage(
  `inj-dex-v6-${process.env.APP_ENV || 'dex'}`
)
