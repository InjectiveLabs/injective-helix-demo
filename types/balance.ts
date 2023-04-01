import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { PositionsWithUPNL } from '@injectivelabs/sdk-ts'
import { AggregatedBalanceType } from '@/types/enums'

export interface SubaccountBalance {
  denom: string
  availableBalance: string
  totalBalance: string
}

export type AccountBalance = Omit<BalanceWithTokenAndPrice, 'balance'> & {
  // Bank balance
  bankBalance: string
  // the available balance for the subaccount, defaults to 0 for the default subaccount
  availableBalance: string
  // for the default subaccount its the reservedBalance, for the others its available + reserved
  totalBalance: string
  // The unrealized PnL from open positions
  unrealizedPnl: string
  // Balance in orders (total - available from the subaccount)
  inOrderBalance: string
  // the available margin depending on the subaccount (bank for default, subaccount available for non-default)
  availableMargin: string

  // The total balance of the account - bank + available + inOrderBalance + unrealizedPnL
  accountTotalBalance: string
  accountTotalBalanceInUsd: string
}

export type AccountBalanceWithAggregatedType = AccountBalance & {
  type?: AggregatedBalanceType
}

export interface PositionWithPnlAndDenom extends PositionsWithUPNL {
  denom?: string
}
