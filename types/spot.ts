import {
  SpotMarket as BaseUiSpotMarket,
  SpotTrade as UiSpotTrade,
  SpotLimitOrder as UiSpotLimitOrder,
  Orderbook as UiSpotOrderbook,
  ChronosSpotMarketSummary,
  SpotOrderType,
  AllChronosSpotMarketSummary
} from '@injectivelabs/spot-consumer'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'

import { Token } from './token'

export interface UiSpotMarket
  extends Omit<BaseUiSpotMarket, 'quoteToken' | 'baseToken'>,
    ChronosSpotMarketSummary {
  slug: string
  quoteToken: Token
  baseToken: Token
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
  SpotOrderType,
  TradeExecutionType,
  BaseUiSpotMarket,
  ChronosSpotMarketSummary,
  AllChronosSpotMarketSummary,
  UiSpotOrderbook
}
