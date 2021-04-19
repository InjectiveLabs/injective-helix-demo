import {
  SpotMarket as BaseUiSpotMarket,
  SpotMarketTrade as UiSpotMarketTrade,
  SpotMarketOrder as UiSpotMarketOrder,
  Orderbook as UiOrderbook,
  PriceLevel as UiPriceLevel,
  ChronosSpotMarketSummary,
  SpotOrderType,
  TradeDirection,
  TradeExecutionType,
  AllChronosSpotMarketSummary
} from '@injectivelabs/spot-consumer'

import { Token } from './token'

export interface UiSpotMarket
  extends BaseUiSpotMarket,
    ChronosSpotMarketSummary {
  quoteToken: Token
  baseToken: Token
}

export interface UiOrderbookPriceLevel {
  price: string
  quantity: string
  timestamp: string
  oldQuantity?: string
  sumOfQuantities: string
  depth: number
}

export enum SpotMarketMap {
  BUY = 0,
  SELL = 1,
  STOP_BUY = 2,
  STOP_SELL = 3,
  TAKE_BUY = 4,
  TAKE_SELL = 5
}

export {
  UiPriceLevel,
  UiSpotMarketTrade,
  TradeDirection,
  SpotOrderType,
  TradeExecutionType,
  UiSpotMarketOrder,
  BaseUiSpotMarket,
  ChronosSpotMarketSummary,
  AllChronosSpotMarketSummary,
  UiOrderbook
}
