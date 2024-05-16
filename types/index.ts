import { Component } from 'vue'
import { RouteLocationRaw } from 'vue-router'
import { Wallet } from '@injectivelabs/wallet-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PointsMultiplier } from '@injectivelabs/sdk-ts'
import { TokenStatic } from '@injectivelabs/token-metadata'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { SharedSubaccountBalanceWithToken } from '@shared/types'
import { MenuItemType, NoticeBanner } from './enums'
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
  browserCountry: string
  vpnCheckTimestamp: number
}

export interface SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
  extends Omit<SharedSubaccountBalanceWithToken, 'totalBalance'> {
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
    spot?: string
    slug?: string
  }
}

export interface TradeConfirmationModalData {
  amount: BigNumberInBase
  amountSymbol: string
  isReduceOnly?: boolean
  orderType: OrderSide
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
  token?: TokenStatic
}

export interface Banner {
  label: string
  key: NoticeBanner
  viewMore?: string
  viewMoreLink?: string
}

export type I18nMessageFunction = {
  type: string
  interpolate: Function
  named: Function
}

export interface AmplitudeTrackerUser {
  wallet: Wallet
  address: string
  tierLevel: number
}
type MenuItemBase = {
  label: string
  description?: string
  icon?: Component
  isExternal?: boolean
}

export type MenuItem =
  | (MenuItemBase & {
      type: MenuItemType.Link
      to: RouteLocationRaw
    })
  | (MenuItemBase & {
      type: MenuItemType.Dropdown
      icon?: Component
      items: MenuItem[]
    })

export * from './page'
export * from './swap'
export * from './enums'
export * from './forms'
export * from './trade'
export * from './states'
export * from './balance'
export * from './symbols'
export * from './account'
export * from './bulletin'
export * from './campaign'
export * from './activity'
export * from './exchange'
export * from './institutional'
