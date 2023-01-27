import { Token } from '@injectivelabs/token-metadata'
import {
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice,
  TokenWithUsdPrice
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  PaginationOption,
  SpotOrderSide,
  DerivativeOrderSide,
  PointsMultiplier
} from '@injectivelabs/sdk-ts'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { ConditionalOrderSide, TradeExecutionType } from '@/types'

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

export interface AccountBalance {
  bankBalance: BigNumberInBase
  subaccountAvailableBalance: BigNumberInBase
  subaccountTotalBalance: BigNumberInBase
  inOrderBalance: BigNumberInBase
  margin: BigNumberInBase
  pnl: BigNumberInBase
  token: TokenWithUsdPrice
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

export interface DefaultMarketRoute {
  to: {
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

export interface FilterOptions {
  marketId?: string
  marketIds?: string[]
  direction?: TradeDirection
  orderSide?: SpotOrderSide | DerivativeOrderSide
  orderType?: SpotOrderSide | DerivativeOrderSide
  orderTypes?: ConditionalOrderSide[]
  executionTypes?: TradeExecutionType[]
  types?: TradeExecutionType[]
  denom?: string
  isConditional?: boolean
}

export interface ActivityFetchOptions {
  pagination?: PaginationOption
  filters?: FilterOptions
  options?: {
    updateTotalCounts?: boolean
  }
}

export interface OrderTypeFilter {
  executionType?: string
  orderType?: string
}

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

export * from './balance'
export * from './bridge'
export * from './enums'
export * from './errors'
export * from './states'
export * from './trade'
