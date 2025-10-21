import type { TokenStatic } from '@injectivelabs/sdk-ts'
import type { SubaccountTransferField } from './enums'

export type SubaccountTransferForm = {
  [SubaccountTransferField.Denom]: string
  [SubaccountTransferField.Amount]: string
  [SubaccountTransferField.Token]: TokenStatic
  [SubaccountTransferField.SrcSubaccountId]: string
  [SubaccountTransferField.DstSubaccountId]: string
}

export interface UiSubaccountTransaction {
  denom: string
  amount: string
  sender: string
  receiver: string
  timestamp: number
  explorerLink: string
}

export interface UiSubaccountTransactionWithToken
  extends UiSubaccountTransaction {
  token: TokenStatic
}
export interface SubAccount {
  value: string
  display: string
}
