import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'

export type BalanceWithToken = BankBalanceWithToken & {
  balanceInToken: string
}

export type BalanceWithTokenAndUsdPrice = BankBalanceWithToken & {
  balanceInToken: string
  usdPrice: number
}

export type AccountBalance = BalanceWithTokenAndUsdPrice & {
  totalBalance: string
  totalBalanceInUsd: string
  reservedBalance: string
}
