import {
  SubaccountTransfer as GrpcSubaccountTransfer,
  AccountPortfolio,
  SubaccountPortfolio,
  TransferType
} from '@injectivelabs/subaccount-consumer'
import { Token } from '.'

export interface UiSubaccountBalance {
  totalBalance: string
  availableBalance: string
  denom: string
}

export interface UiSubaccountBalanceWithToken
  extends Omit<
    UiSubaccountBalance,
    'totalBalance' | 'denom' | 'availableBalance'
  > {
  totalBalance: string // BigNumberInWei
  availableBalance: string // BigNumberInWei
}

export interface UiSubaccount {
  subaccountId: string
  balances: UiSubaccountBalance[]
}

export interface UiSubaccountTransfer extends GrpcSubaccountTransfer {
  amount: {
    amount: string
    denom: string
  }
  token: Token
}

export {
  GrpcSubaccountTransfer,
  AccountPortfolio,
  SubaccountPortfolio,
  TransferType
}
