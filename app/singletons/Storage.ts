import { LocalStorage } from '@injectivelabs/utils'

export const localStorage: LocalStorage = new LocalStorage(
  `inj-dex-v5-${process.env.APP_ENV || 'staking'}`
)
