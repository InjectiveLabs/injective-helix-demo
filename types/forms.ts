import {
  PositionsFilterField,
  SpotOpenOrdersFilterField,
  SpotOrderHistoryFilterField
} from './enums'

export type PositionsFilterForm = {
  [PositionsFilterField.Market]: string
  [PositionsFilterField.Side]: string
}

export type SpotOpenOrdersFilterForm = {
  [SpotOpenOrdersFilterField.Market]: string
  [SpotOpenOrdersFilterField.Side]: string
}

export type SpotOrderHistoryFilterForm = {
  [SpotOrderHistoryFilterField.Market]: string
  [SpotOrderHistoryFilterField.Side]: string
  [SpotOrderHistoryFilterField.Type]: string
}
