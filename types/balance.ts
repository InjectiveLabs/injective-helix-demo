import { PositionsWithUPNL } from '@injectivelabs/sdk-ts'
import { SharedBalanceInUsdWithTokenAndPrice } from '@shared/types'
import { AggregatedBalanceType } from '@/types/enums'

export interface SubaccountBalance {
  denom: string
  availableBalance: string
  totalBalance: string
}

export interface SubaccountBalanceWithInOrder extends SubaccountBalance {
  inOrderBalance: string
}

export type AccountBalance = Omit<
  SharedBalanceInUsdWithTokenAndPrice,
  'balance'
> & {
  isVerified: boolean
  // the available balance for the subaccount
  // for the default subaccount its the bank balance
  availableBalance: string
  // the total balance -  bank + available + inOrderBalance + unrealizedPnL
  // non default subaccount - available + inOrderBalance + unrealizedPnL
  totalBalance: string
  // The unrealized PnL from open positions
  unrealizedPnl: string
  // Balance in orders (total - available from the subaccount)
  inOrderBalance: string
  totalBalanceInUsd: string
  unrealizedPnlAndMarginInUsd: string
}

export type AccountBalanceWithAggregatedType = AccountBalance & {
  type?: AggregatedBalanceType
}

export interface PositionWithPnlAndDenom extends PositionsWithUPNL {
  denom?: string
}
