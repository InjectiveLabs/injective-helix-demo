import { BigNumberInWei } from '@injectivelabs/utils'
import { Token } from './token'

export interface UiSubaccountBalance {
  totalBalance: string
  availableBalance: string
  token: Token
  denom: string
}

export interface UiSubaccountBalanceToBN
  extends Omit<UiSubaccountBalance, 'totalBalance' | 'availableBalance'> {
  totalBalance: BigNumberInWei
  availableBalance: BigNumberInWei
  displayDecimals: number
}

export interface UiSubaccount {
  subaccountId: string
  balances: UiSubaccountBalance[]
}
