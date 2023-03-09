import {
  SpotOrderSide,
  DerivativeOrderSide,
  PointsMultiplier
} from '@injectivelabs/sdk-ts'
import {
  UiSpotOrderbook,
  UiDerivativeOrderbook,
  SubaccountBalanceWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { NoticeBanner } from './enums'
import { TradeExecutionType } from '@/types'

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

export interface MarketRoute {
  name: string
  params?: {
    market?: string
    derivative?: string
    futures?: string
    perpetual?: string
    binaryOption?: string
    spot?: string
  }
}

export interface TradeConfirmationModalData {
  amount: BigNumberInBase
  amountSymbol: string
  isReduceOnly?: boolean
  orderType: SpotOrderSide | DerivativeOrderSide
  price?: BigNumberInBase
  priceSymbol?: string
  tradingType: TradeExecutionType
  triggerPrice?: BigNumberInBase
  triggerPriceSymbol?: string
}

export type TokenUsdPriceMap = Record<string, number>

export interface TabOption {
  value: string
  label: string
  url?: string
}

export interface MarketPromotion {
  market: string
  url: string
  start: number
  end: number
}

export interface PointsMultiplierWithMarketTicker extends PointsMultiplier {
  ticker: string
  slug: string
}

export interface DropdownOption extends BaseDropdownOption {
  icon?: string
}

export interface DropdownOptionWithToken extends BaseDropdownOption {
  token?: Token
}

export interface UiSpotOrderbookWithSequence extends UiSpotOrderbook {
  sequence: number
}

export interface UiDerivativeOrderbookWithSequence
  extends UiDerivativeOrderbook {
  sequence: number
}

export interface Banner {
  label: string
  key: NoticeBanner
  viewMore: string
  viewMoreLink: string
}

export * from './enums'
export * from './trade'
export * from './bridge'
export * from './states'
export * from './balance'
export * from './activity'
