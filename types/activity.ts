import type { PaginationOption } from '@injectivelabs/sdk-ts'
import type { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import type {
  ActivityField,
  TradeExecutionType,
  ConditionalOrderSide
} from '@/types'

export type ActivityForm = Record<ActivityField, any>

export type ActivityFormValue = {
  value: string
  field: ActivityField
}

export interface FilterOptions {
  denom?: string
  marketIds?: string[]
  orderSide?: OrderSide
  isConditional?: boolean
  direction?: TradeDirection
  orderTypes?: ConditionalOrderSide[]
  executionTypes?: TradeExecutionType[]
}

export interface ActivityFetchOptions {
  subaccountId?: string
  filters?: FilterOptions
  pagination?: PaginationOption
}
