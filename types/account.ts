import { TokenStatic } from '@injectivelabs/sdk-ts'
import { SubaccountTransferField } from './enums'

export type SubaccountTransferForm = {
  [SubaccountTransferField.Amount]: string
  [SubaccountTransferField.SrcSubaccountId]: string
  [SubaccountTransferField.DstSubaccountId]: string
  [SubaccountTransferField.Denom]: string
  [SubaccountTransferField.Token]: TokenStatic
}

export interface UiSubaccountTransaction {
  amount: string
  denom: string
  receiver: string
  sender: string
  explorerLink: string
  timestamp: number
}

export interface UiSubaccountTransactionWithToken
  extends UiSubaccountTransaction {
  token: TokenStatic
}
export interface SubAccount {
  display: string
  value: string
}
