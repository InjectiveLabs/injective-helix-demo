import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { AggregatedBalanceType } from '@/types/enums'

export type AccountBalance = BalanceWithTokenAndPrice & {
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
