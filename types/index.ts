import {
  SubaccountBalanceWithToken,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types/dist/trade'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PaginationOption } from '@injectivelabs/sdk-ts'

export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
  keyCode?: number
  key?: string
  view?: {
    getSelection: Function
  }
}

export interface Constructable<T> {
  new (...args: any): T
}

export interface GeoLocation {
  continent: string
  country: string
}

export interface SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
  extends Omit<SubaccountBalanceWithToken, 'totalBalance'> {
  inOrderBalance: BigNumberInBase
  margin: BigNumberInBase
  pnlInUsd: BigNumberInBase
  totalBalance: BigNumberInBase
  totalBalanceInUsd: BigNumberInBase
}

export interface UiMarketAndSummary {
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
  summary: UiDerivativeMarketSummary | UiSpotMarketSummary
}

export interface UiMarketAndSummaryWithVolumeInUsd extends UiMarketAndSummary {
  volumeInUsd: BigNumberInBase
}

export interface MarketRoute {
  name: string
  params?: {
    marketId: string
    market?: string
    derivative?: string
    perpetual?: string
    binaryOption?: string
    spot?: string
  }
}

export declare type TokenUsdPriceMap = Record<string, number>

export interface FilterOptions {
  marketId?: string
  marketIds?: string[]
  direction?: TradeDirection
  type?: TradeExecutionType,
  denom?: string
}

export interface ActivityFetchOptions {
  pagination?: PaginationOption
  filters?: FilterOptions
}

export * from './enums'
export * from './env'
export * from './errors'
export * from './states'
