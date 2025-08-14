import type { BigNumberInBase } from '@injectivelabs/utils'
import type { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import type {
  ExitType,
  DerivativeLimitOrder,
  DerivativeOrderHistory
} from '@injectivelabs/sdk-ts'
import type {
  SharedUiSpotTrade,
  SharedUiSpotMarket,
  SharedUiMarketSummary,
  SharedUiDerivativeTrade,
  SharedUiDerivativeMarket
} from '@shared/types'
import type {
  TradeField,
  TradeTypes,
  TradeAmountOption,
  InvestmentTypeGst,
  SpotTradeFormField,
  DerivativeTradeTypes,
  SpotGridTradingField,
  SpotGridStrategyType,
  DerivativesTradeFormField,
  DerivativeGridTradingField,
  ClosePositionLimitFormField,
  TakeProfitStopLossFormField
} from '@/types'

// TODO: Rename and move these to injective-ts
export enum ConditionalOrderType {
  StopLoss = 'stop_loss',
  TakeProfit = 'take_profit'
}

export enum ConditionalOrderSide {
  Buy = 'buy',
  Sell = 'sell',
  StopBuy = 'stop_buy',
  TakeBuy = 'take_buy',
  StopSell = 'stop_sell',
  TakeSell = 'take_sell'
}

export type TradeForm = Record<TradeField, any>

export type CurrentMarket = undefined | UiMarketWithToken

export type MarketMarkPriceMap = Record<string, MarketMarkPrice>

export type UiMarketWithToken = UiSpotMarket | UiDerivativeMarket

export type UiTrade = SharedUiSpotTrade | SharedUiDerivativeTrade

export type GridMarket = {
  slug: string
  contractAddress: string
}

export type OrderBookPriceAndType = {
  price: string
  isBuy: boolean
}

export type UIDerivativeOrder = DerivativeLimitOrder | DerivativeOrderHistory

export type OrderBookQuantityAndType = {
  isBuy: boolean
  quantity: string
}

export interface UiSpotMarket extends SharedUiSpotMarket {
  isVerified: boolean
}

export type TradeFormValue = {
  field: TradeField
  value: string | number | boolean
}

export type MarketMarkPrice = {
  price: string
  marketId: string
  timestamp?: number
}

export interface UiDerivativeMarket extends SharedUiDerivativeMarket {
  isVerified: boolean
}

export type OrderBookNotionalAndType = {
  total: string
  isBuy: boolean
  quantity: string
}

export interface UiMarketAndSummary {
  market: UiMarketWithToken
  summary: SharedUiMarketSummary
}

export type MaxAmountOnOrderbook = {
  totalNotional: BigNumberInBase
  totalQuantity: BigNumberInBase
}

export interface UiMarketAndSummaryWithVolumeInUsd extends UiMarketAndSummary {
  volumeInUsd: BigNumberInBase
}

export type ClosePositionLimitForm = {
  [ClosePositionLimitFormField.Price]: string
  [ClosePositionLimitFormField.Quantity]: string
}

export type TakeProfitStopLossForm = {
  [TakeProfitStopLossFormField.StopLoss]: string
  [TakeProfitStopLossFormField.TakeProfit]: string
}

export type LiquidityValues = {
  grids: number
  upperBound: BigNumberInBase
  lowerBound: BigNumberInBase
  currentPrice: BigNumberInBase
  trailingUpperBound: BigNumberInBase
  trailingLowerBound: BigNumberInBase
}

export type SpotTradeForm = {
  [SpotTradeFormField.Price]: string
  [SpotTradeFormField.Amount]: string
  [SpotTradeFormField.Side]: OrderSide
  [SpotTradeFormField.Type]: TradeTypes
  [SpotTradeFormField.Slippage]: string
  [SpotTradeFormField.PostOnly]: boolean
  [SpotTradeFormField.BypassPriceWarning]: boolean
  [SpotTradeFormField.AmountOption]: TradeAmountOption
}

export type DerivativeGridTradingForm = {
  [DerivativeGridTradingField.Grids]: string
  [DerivativeGridTradingField.Margin]: string
  [DerivativeGridTradingField.Leverage]: string
  [DerivativeGridTradingField.StopLoss]: string
  [DerivativeGridTradingField.LowerPrice]: string
  [DerivativeGridTradingField.UpperPrice]: string
  [DerivativeGridTradingField.TakeProfit]: string
}

export type DerivativesTradeForm = {
  [DerivativesTradeFormField.Amount]: string
  [DerivativesTradeFormField.Slippage]: string
  [DerivativesTradeFormField.Leverage]: string
  [DerivativesTradeFormField.StopLoss]: string
  [DerivativesTradeFormField.PostOnly]: boolean
  [DerivativesTradeFormField.LimitPrice]: string
  [DerivativesTradeFormField.TakeProfit]: string
  [DerivativesTradeFormField.ReduceOnly]: boolean
  [DerivativesTradeFormField.Side]: TradeDirection
  [DerivativesTradeFormField.TriggerPrice]: string
  [DerivativesTradeFormField.isTpSlEnabled]: boolean
  [SpotTradeFormField.AmountOption]: TradeAmountOption
  [DerivativesTradeFormField.Type]: DerivativeTradeTypes
  [DerivativesTradeFormField.BypassPriceWarning]: boolean
}

export type SpotGridTradingForm = {
  [SpotGridTradingField.Grids]: string
  [SpotGridTradingField.StopLoss]: string
  [SpotGridTradingField.SettleIn]: boolean
  [SpotGridTradingField.IsLpMode]: boolean
  [SpotGridTradingField.LowerPrice]: string
  [SpotGridTradingField.UpperPrice]: string
  [SpotGridTradingField.ExitType]: ExitType
  [SpotGridTradingField.TakeProfit]: string
  [SpotGridTradingField.TrailingUpper]: string
  [SpotGridTradingField.TrailingLower]: string
  [SpotGridTradingField.IsTrailingEnabled]: boolean
  [SpotGridTradingField.SellBaseOnStopLoss]: boolean
  [SpotGridTradingField.IsAssetRebalanceOn]: boolean
  [SpotGridTradingField.BaseInvestmentAmount]: string
  [SpotGridTradingField.BuyBaseOnTakeProfit]: boolean
  [SpotGridTradingField.QuoteInvestmentAmount]: string
  [SpotGridTradingField.InvestmentType]: InvestmentTypeGst
  [SpotGridTradingField.StrategyType]: SpotGridStrategyType
}
