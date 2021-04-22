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
  extends Omit<BaseUiSpotMarket, 'quoteToken' | 'baseToken'>,
    ChronosSpotMarketSummary {
  quoteToken: Token
  baseToken: Token
}

export interface UiOrderbookPriceLevel {
  price: string
  quantity: string
  timestamp: number
  oldQuantity?: string
  sumOfQuantities: string
  depth: number
}

export enum SpotMarketMap {
  UNSPECIFIED = 0,
  BUY = 1,
  SELL = 2,
  STOP_BUY = 3,
  STOP_SELL = 4,
  TAKE_BUY = 5,
  TAKE_SELL = 6
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
