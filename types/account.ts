import { Token } from '@injectivelabs/token-metadata'
import { SubaccountTransferField } from './enums'

export type SubaccountTransferForm = {
  [SubaccountTransferField.Amount]: string
  [SubaccountTransferField.SrcSubaccountId]: string
  [SubaccountTransferField.DstSubaccountId]: string
  [SubaccountTransferField.Denom]: string
  [SubaccountTransferField.Token]: Token
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
  token: Token
}
