import type { Token } from '@injectivelabs/token-metadata'
import { BridgeField } from '@/types'

export type BridgeForm = Record<BridgeField, any>

export type BridgeFormValue = {
  field: BridgeField
  value: string | Token
}
