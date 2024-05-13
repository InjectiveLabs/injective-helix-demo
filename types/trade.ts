import {
  SharedUiSpotTrade,
  SharedUiSpotMarket,
  SharedUiMarketSummary,
  SharedUiDerivativeTrade,
  SharedUiDerivativeMarket
} from '@shared/types'
import {
  ExitType,
  StrategyType,
  DerivativeLimitOrder,
  DerivativeOrderHistory
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  TradeField,
  TradeTypes,
  TradeAmountOption,
  InvestmentTypeGst,
  SpotTradeFormField,
  DerivativeTradeTypes,
  SpotGridTradingField,
  DerivativesTradeFormField
} from '../types'

export type TradeForm = Record<TradeField, any>

export type TradeFormValue = {
  field: TradeField
  value: string | number | boolean
}

export interface UiSpotMarket extends SharedUiSpotMarket {
  isVerified: boolean
}

export interface UiDerivativeMarket extends SharedUiDerivativeMarket {
  isVerified: boolean
}

export type UiMarketWithToken = UiSpotMarket | UiDerivativeMarket

export type CurrentMarket = UiMarketWithToken | undefined

export type UiTrade = SharedUiSpotTrade | SharedUiDerivativeTrade

export type UIDerivativeOrder = DerivativeLimitOrder | DerivativeOrderHistory

export interface UiMarketAndSummary {
  market: UiMarketWithToken
  summary: SharedUiMarketSummary
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
  [SpotTradeFormField.AmountOption]: TradeAmountOption
  // [SpotTradeFormField.Quantity]: string
  // [SpotTradeFormField.Total]: string
}

export type DerivativesTradeForm = {
  [DerivativesTradeFormField.Side]: OrderSide
  [DerivativesTradeFormField.Amount]: string
  [SpotTradeFormField.AmountOption]: TradeAmountOption
  // [DerivativesTradeFormField.Total]: string
  // [DerivativesTradeFormField.Quantity]: string
  [DerivativesTradeFormField.Slippage]: string
  [DerivativesTradeFormField.Leverage]: string
  [DerivativesTradeFormField.PostOnly]: boolean
  [DerivativesTradeFormField.LimitPrice]: string
  [DerivativesTradeFormField.ReduceOnly]: boolean
  [DerivativesTradeFormField.TriggerPrice]: string
  [DerivativesTradeFormField.IsSlippageOn]: boolean
  [DerivativesTradeFormField.Type]: DerivativeTradeTypes
}
