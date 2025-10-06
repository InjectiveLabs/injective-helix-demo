import type { Wallet } from '@injectivelabs/wallet-base'

export type SharedWalletOption = {
  beta?: boolean
  wallet: Wallet
  downloadLink?: string
}

export interface AutoSign {
  duration: number
  privateKey: string
  expiration: number
  injectiveAddress: string
}
