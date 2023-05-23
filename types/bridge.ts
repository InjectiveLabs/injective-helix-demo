import type { Token } from '@injectivelabs/token-metadata'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { BridgeField, BridgeType, SubaccountTransferField } from '@/types'

export type BridgeForm = {
  [BridgeField.Amount]: string
  [BridgeField.BridgeType]: BridgeType
  [BridgeField.BridgingNetwork]: BridgingNetwork
  [BridgeField.Denom]: string
  [BridgeField.Destination]: string
  [BridgeField.Memo]: string
  [BridgeField.Token]: Token
}

export type SubaccountTransferForm = {
  [SubaccountTransferField.Amount]: string
  [SubaccountTransferField.SrcSubaccountId]: string
  [SubaccountTransferField.DstSubaccountId]: string
  [SubaccountTransferField.Denom]: string
  [SubaccountTransferField.Token]: Token
}
