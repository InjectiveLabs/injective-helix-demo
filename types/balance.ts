import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { AggregatedBalanceType } from '@/types/enums'

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

  // bankBalance + subaccountBalance (same as balance)
  totalBalance: string
  totalBalanceInUsd: string

  // in order balances + unrealized pnl + used margin
  reservedBalance: string
}

export type AccountBalanceWithAggregatedType = AccountBalance & {
  type?: AggregatedBalanceType
}
