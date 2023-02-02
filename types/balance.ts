import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'

export type BalanceWithToken = BankBalanceWithToken & {
  balanceToBase: string
}

export type BalanceWithTokenAndUsdPrice = BankBalanceWithToken & {
  balanceToBase: string
  usdPrice: number
}

export type AccountBalance = BalanceWithTokenAndUsdPrice & {
  bankBalance: string
  subaccountBalance: string

  // bankBalance + subaccountBalance
  totalBalance: string
  totalBalanceInUsd: string

  // in order balances + unrealized pnl + used margin
  reservedBalance: string
}
