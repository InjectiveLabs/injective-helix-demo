import { ChainId } from '@injectivelabs/ts-types'

export type TokenAddress = string
export type TokenAssetData = string
export type TokenSymbol = string

interface Base {
  symbol: string
  name: string
  icon?: string
  decimals: number
}

export interface Token extends Base {
  address: string
  denom: string
  coinGeckoId: string
}

export interface TokenWithAddresses extends Base {
  addresses: Record<ChainId, string>
}

export interface TokenWithBalance extends Base {
  address: string
  denom: string
  balance: string // BigNumberInWei
  allowance: string // BigNumberInWei
  coinGeckoId: string
  priceInUsd?: number
}
