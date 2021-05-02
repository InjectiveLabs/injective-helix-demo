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
  baseTokenSymbol: string
  quoteToken: Token
}

export enum DerivativeMarketMap {
  UNSPECIFIED = 0,
  LONG = 1,
  SHORT = 2,
  STOP_LONG = 3,
  STOP_SHORT = 4,
  TAKE_LONG = 5,
  TAKE_SHORT = 6
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
