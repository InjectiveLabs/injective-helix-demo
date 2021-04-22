import { BigNumberInWei } from '@injectivelabs/utils'
import { Token } from './token'

export interface UiSubaccountBalance {
  totalBalance: string
  availableBalance: string
  denom: string
}

export interface UiSubaccountBalanceWithToken
  extends Omit<UiSubaccountBalance, 'totalBalance' | 'availableBalance'> {
  totalBalance: BigNumberInWei
  availableBalance: BigNumberInWei
  displayDecimals: number
  token: Token
}

export interface UiSubaccount {
  subaccountId: string
  balances: UiSubaccountBalance[]
}
