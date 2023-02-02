import { TradeDirection } from '@injectivelabs/ts-types'
import {
  PaginationOption,
  SpotOrderSide,
  DerivativeOrderSide
} from '@injectivelabs/sdk-ts'
import {
  ConditionalOrderSide,
  TradeExecutionType,
  ActivityField
} from '@/types'

export type ActivityForm = Record<ActivityField, any>

export type ActivityFormValue = {
  field: ActivityField
  value: string
}

export interface FilterOptions {
  marketIds?: string[]
  direction?: TradeDirection
  orderSide?: SpotOrderSide | DerivativeOrderSide
  orderTypes?: ConditionalOrderSide[]
  executionTypes?: TradeExecutionType[]
  denom?: string
  isConditional?: boolean
}

export interface ActivityFetchOptions {
  filters?: FilterOptions
  pagination?: PaginationOption
}
