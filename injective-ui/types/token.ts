import type { TokenStatic } from '@injectivelabs/sdk-ts'

export type SharedTokenUsdPriceMap = Record<string, number>

export interface SharedBalanceWithToken {
  denom: string
  balance: string
  token: TokenStatic
}

export interface SharedBalanceWithTokenAndPrice extends SharedBalanceWithToken {
  usdPrice: number
}

export interface SharedDropdownOptionWithToken {
  value: string
  display: string
  token?: TokenStatic
}

export interface SharedBalanceInUsdWithTokenAndPrice
  extends SharedBalanceWithTokenAndPrice {
  balanceInUsd: string
}

export interface SharedSubaccountBalanceWithToken {
  denom: string
  token: TokenStatic
  totalBalance: string
  availableBalance: string
}
