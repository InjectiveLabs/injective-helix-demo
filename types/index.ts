import { Token } from '@injectivelabs/token-metadata'
import {
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SpotOrderSide,
  DerivativeOrderSide,
  PointsMultiplier
} from '@injectivelabs/sdk-ts'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
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

export interface BankBalanceWithTokenWithBalanceAndPrice {
  balance: string
  denom: string
  token: TokenWithBalanceAndPrice
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

export declare type TokenUsdPriceMap = Record<string, number>

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

export * from './activity'
export * from './balance'
export * from './bridge'
export * from './enums'
export * from './states'
export * from './trade'
