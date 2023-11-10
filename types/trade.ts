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
import {
  TradeField,
  InvestmentTypeGst,
  AuctionTradingField,
  SpotGridTradingField
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

export type AuctionTradingForm = Record<AuctionTradingField, string>

export type SpotGridTradingForm = {
  [SpotGridTradingField.Grids]: string
  [SpotGridTradingField.LowerPrice]: string
  [SpotGridTradingField.UpperPrice]: string
  [SpotGridTradingField.InvestmentAmount]: string
  [SpotGridTradingField.BaseInvestmentAmount]: string
  [SpotGridTradingField.BaseInvestmentAmount]: string
  [SpotGridTradingField.InvestmentType]: InvestmentTypeGst
  [SpotGridTradingField.TakeProfit]: string
  [SpotGridTradingField.StopLoss]: string
  [SpotGridTradingField.SellAllBase]: boolean
}

export type SpotGridMarket = {
  slug: string
  contractAddress: string
}
