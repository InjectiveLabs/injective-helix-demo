import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderHistory,
  UiDerivativeTrade,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  UiSpotTrade
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ExitType, StrategyType } from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  TradeField,
  InvestmentTypeGst,
  SpotGridTradingField,
  TradeTypes,
  SpotTradeFormField,
  DerivativesTradeFormField,
  DerivativeTradeTypes,
  SpotAmountOption
} from '../types'

export type TradeForm = Record<TradeField, any>

export type TradeFormValue = {
  field: TradeField
  value: string | number | boolean
}

export type UiMarketWithToken =
  | UiDerivativeMarketWithToken
  | UiSpotMarketWithToken

export type CurrentMarket = UiMarketWithToken | undefined

export type UiMarketSummary = UiDerivativeMarketSummary | UiSpotMarketSummary
export type UiTrade = UiDerivativeTrade | UiSpotTrade

export type UIDerivativeOrder =
  | UiDerivativeOrderHistory
  | UiDerivativeLimitOrder

export interface UiMarketAndSummary {
  market: UiMarketWithToken
  summary: UiMarketSummary
}

export interface UiMarketAndSummaryWithVolumeInUsd extends UiMarketAndSummary {
  volumeInUsd: BigNumberInBase
}

// TODO: Rename and move these to injective-ts
export enum ConditionalOrderType {
  TakeProfit = 'take_profit',
  StopLoss = 'stop_loss'
}

export enum ConditionalOrderSide {
  Buy = 'buy',
  Sell = 'sell',
  StopBuy = 'stop_buy',
  StopSell = 'stop_sell',
  TakeBuy = 'take_buy',
  TakeSell = 'take_sell'
}

export type OrderBookPriceAndType = {
  isBuy: boolean
  price: string
}

export type OrderBookQuantityAndType = {
  isBuy: boolean
  quantity: string
}

export type OrderBookNotionalAndType = {
  isBuy: boolean
  quantity: string
  total: string
}

export type MaxAmountOnOrderbook = {
  totalNotional: BigNumberInBase
  totalQuantity: BigNumberInBase
}

export enum USDCSymbol {
  PeggyEthereum = 'USDC',
  WormholeEthereum = 'USDCet',
  WormholeSolana = 'USDCso'
}

export type MarketMarkPrice = {
  price: string
  marketId: string
  timestamp?: number
}

export type MarketMarkPriceMap = Record<string, MarketMarkPrice>

export type SpotGridTradingForm = {
  [SpotGridTradingField.Grids]: string
  [SpotGridTradingField.LowerPrice]: string
  [SpotGridTradingField.UpperPrice]: string
  [SpotGridTradingField.QuoteInvestmentAmount]: string
  [SpotGridTradingField.BaseInvestmentAmount]: string
  [SpotGridTradingField.InvestmentType]: InvestmentTypeGst
  [SpotGridTradingField.SellBaseOnStopLoss]: boolean
  [SpotGridTradingField.BuyBaseOnTakeProfit]: boolean
  [SpotGridTradingField.SettleIn]: boolean
  [SpotGridTradingField.ExitType]: ExitType
  [SpotGridTradingField.StopLoss]: string
  [SpotGridTradingField.TakeProfit]: string
  [SpotGridTradingField.StrategyType]: StrategyType
  [SpotGridTradingField.IsAssetRebalanceOn]: boolean
}

export type GridMarket = {
  slug: string
  contractAddress: string
}

export type NotLiquidMarket = {
  slug: string
  redirectionSlug: string
}

export type SpotTradeForm = {
  [SpotTradeFormField.Type]: TradeTypes
  [SpotTradeFormField.Side]: OrderSide
  [SpotTradeFormField.Price]: string
  [SpotTradeFormField.Slippage]: string
  [SpotTradeFormField.PostOnly]: boolean
  [SpotTradeFormField.IsSlippageOn]: boolean
  [SpotTradeFormField.Amount]: string
  [SpotTradeFormField.AmountOption]: SpotAmountOption
  // [SpotTradeFormField.Quantity]: string
  // [SpotTradeFormField.Total]: string
}

export type DerivativesTradeForm = {
  [DerivativesTradeFormField.Total]: string
  [DerivativesTradeFormField.Side]: OrderSide
  [DerivativesTradeFormField.Quantity]: string
  [DerivativesTradeFormField.Slippage]: string
  [DerivativesTradeFormField.Leverage]: string
  [DerivativesTradeFormField.PostOnly]: boolean
  [DerivativesTradeFormField.LimitPrice]: string
  [DerivativesTradeFormField.ReduceOnly]: boolean
  [DerivativesTradeFormField.TriggerPrice]: string
  [DerivativesTradeFormField.IsSlippageOn]: boolean
  [DerivativesTradeFormField.Type]: DerivativeTradeTypes
}
