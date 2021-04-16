import {
  ChronosSpotMarketSummary,
  UiSpotMarket as BaseUiSpotMarket,
  UiSpotMarketTrade,
  SpotOrderType,
  UiSpotMarketOrder,
  UiOrderbook,
  UiPriceLevel,
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
