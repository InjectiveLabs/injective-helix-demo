import type { Token } from '@injectivelabs/token-metadata'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import {
  BridgeType,
  BridgeField,
  SubaccountTransferField
} from '../types/enums'

export type BridgeForm = {
  [BridgeField.Amount]: string
  [BridgeField.BridgeType]: BridgeType
  [BridgeField.BridgingNetwork]: BridgingNetwork
  [BridgeField.Denom]: string
  [BridgeField.Destination]: string
  [BridgeField.Memo]: string
}

export type SubaccountTransferForm = {
  [SubaccountTransferField.Amount]: string
  [SubaccountTransferField.SrcSubaccountId]: string
  [SubaccountTransferField.DstSubaccountId]: string
  [SubaccountTransferField.Denom]: string
  [SubaccountTransferField.Token]: Token
}
