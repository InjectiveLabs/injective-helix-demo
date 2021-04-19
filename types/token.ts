import { ChainId } from '@injectivelabs/ts-types'
import { BigNumberInWei } from '@injectivelabs/utils'

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
}

export interface TokenWithAddresses extends Base {
  addresses: Record<ChainId, string>
}

export interface TokenWithBalance extends Base {
  address: string
  denom: string
  balance: BigNumberInWei
  allowance: BigNumberInWei
}
