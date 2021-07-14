import {
  SpotMarket as BaseUiSpotMarket,
  SpotTrade as UiSpotTrade,
  SpotLimitOrder as UiSpotLimitOrder,
  Orderbook as UiSpotOrderbook,
  ChronosSpotMarketSummary,
  SpotOrderSide,
  AllChronosSpotMarketSummary
} from '@injectivelabs/spot-consumer'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'

import { Token } from './token'

export interface UiSpotMarket
  extends Omit<BaseUiSpotMarket, 'quoteToken' | 'baseToken'> {
  slug: string
  priceDecimals: number
  quantityDecimals: number
  quoteToken: Token
  baseToken: Token
}

export interface UiSpotMarketSummary extends ChronosSpotMarketSummary {
  marketId: string
  lastPrice?: number
}

export interface UiSpotMarketAndSummary {
  market: UiSpotMarket
  summary: UiSpotMarketSummary
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
  UiSpotLimitOrder,
  UiSpotTrade,
  TradeDirection,
  SpotOrderSide,
  TradeExecutionType,
  BaseUiSpotMarket,
  ChronosSpotMarketSummary,
  AllChronosSpotMarketSummary,
  UiSpotOrderbook
}
