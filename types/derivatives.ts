import {
  DerivativeMarket as BaseUiDerivativeMarket,
  DerivativeTrade as UiDerivativeTrade,
  Position as UiPosition,
  DerivativeLimitOrder as UiDerivativeLimitOrder,
  Orderbook as UiDerivativeOrderbook,
  ChronosDerivativeMarketSummary,
  DerivativeOrderType,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/derivatives-consumer'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import { Token } from './token'

export interface UiDerivativeMarket
  extends Omit<BaseUiDerivativeMarket, 'quoteToken'>,
    ChronosDerivativeMarketSummary {
  slug: string
  priceDecimals: number
  quantityDecimals: number
  baseTokenSymbol: string
  quoteToken: Token
}

export enum DerivativeMarketMap {
  UNSPECIFIED = 0,
  BUY = 1,
  SELL = 2,
  STOP_BUY = 3,
  STOP_SELL = 4,
  TAKE_BUY = 5,
  TAKE_SELL = 6
}

export {
  UiPosition,
  UiDerivativeLimitOrder,
  UiDerivativeTrade,
  TradeDirection,
  DerivativeOrderType,
  TradeExecutionType,
  BaseUiDerivativeMarket,
  ChronosDerivativeMarketSummary,
  AllChronosDerivativeMarketSummary,
  UiDerivativeOrderbook
}
