import {
  LiquidityBotField,
  PositionsFilterField,
  SpotOpenOrdersFilterField,
  SpotOrderHistoryFilterField,
  VolatilityStrategyType
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

export enum BankTransferField {
  Denom = 'denom',
  Search = 'search',
  Address = 'address',
  Required = 'required',
  MemoValue = 'memo-value',
  DoubleCheck = 'double-check',
  MemoRequired = 'memo-required',
  Amount = 'bank-transfer-amount'
}

export enum NeptuneUsdtField {
  Amount = 'neptune-usdt-amount'
}

export type BankTransferForm = {
  [BankTransferField.Denom]: string
  [BankTransferField.Amount]: string
  [BankTransferField.Search]: string
  [BankTransferField.Address]: string
  [BankTransferField.MemoValue]: string
  [BankTransferField.Required]: boolean
  [BankTransferField.MemoRequired]: string
  [BankTransferField.DoubleCheck]: boolean
}

export type NeptuneUsdtForm = {
  [NeptuneUsdtField.Amount]: string
}

export enum CompetitionWinnerField {
  Name = 'name',
  Email = 'email'
}

export type CompetitionWinnerForm = {
  [CompetitionWinnerField.Name]: string
  [CompetitionWinnerField.Email]: string
}

export type LiquidityBotForm = {
  [LiquidityBotField.Volatility]: VolatilityStrategyType
  [LiquidityBotField.BaseAmount]: string
  [LiquidityBotField.QuoteAmount]: string
}

export enum RwaMarketField {
  TermsAccepted = 'terms-accepted'
}
