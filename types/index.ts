import type { RouteLocationRaw } from 'vue-router'
import type { Wallet } from '@injectivelabs/wallet-base'
import type { OrderSide } from '@injectivelabs/ts-types'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { PointsMultiplier } from '@injectivelabs/sdk-ts'
import type { NoticeBanner, TradeExecutionType } from '@/types'
import type {
  SharedDropdownOption,
  SharedSubaccountBalanceWithToken
} from '@shared/types'

export type MenuItem = NavLink | NavChild

export type TokenUsdPriceMap = Record<string, number>

export interface Constructable<T> {
  new (...args: any): T
}

export interface NavLink extends MenuItemBase {
  to: RouteLocationRaw
}

export interface TabOption {
  url?: string
  value: string
  label: string
}

export interface DropdownOption extends SharedDropdownOption {
  icon?: string
}

export interface NavChild extends MenuItemBase {
  children: Array<NavLink | NavChild>
}

export type WalletOption = {
  beta?: boolean
  wallet: Wallet
  downloadLink?: string
}

export interface AmplitudeTrackerUser {
  wallet: Wallet
  address: string
  tierLevel: number
}

export interface Banner {
  label: string
  key: NoticeBanner
  viewMore?: string
  viewMoreLink?: string
}

export interface PointsMultiplierWithMarketTicker extends PointsMultiplier {
  slug: string
  ticker: string
}
export interface DOMEvent<T extends EventTarget> extends Event {
  target: T
  key?: string
  keyCode?: number
  view?: {
    getSelection: Function
  }
}

export interface MarketRoute {
  name: string
  params?: {
    spot?: string
    slug?: string
    market?: string
    futures?: string
    perpetual?: string
    derivative?: string
  }
}

export interface TradeConfirmationModalData {
  amountSymbol: string
  orderType: OrderSide
  priceSymbol?: string
  isReduceOnly?: boolean
  amount: BigNumberInBase
  price?: BigNumberInBase
  triggerPriceSymbol?: string
  triggerPrice?: BigNumberInBase
  tradingType: TradeExecutionType
}

export interface SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
  extends Omit<SharedSubaccountBalanceWithToken, 'totalBalance'> {
  margin: BigNumberInBase
  pnlInUsd: BigNumberInBase
  totalBalance: BigNumberInBase
  inOrderBalance: BigNumberInBase
  totalBalanceInUsd: BigNumberInBase
}

type MenuItemBase = {
  icon?: string
  label: string
  isExact?: boolean
  isDevOnly?: boolean
  isExternal?: boolean
  description?: string
  isExpandable?: boolean
  isConnectedOnly?: boolean
  isOpenDepositModal?: boolean
}

export * from './page'
export * from './swap'
export * from './grid'
export * from './enums'
export * from './forms'
export * from './trade'
export * from './table'
export * from './points'
export * from './states'
export * from './worker'
export * from './balance'
export * from './symbols'
export * from './account'
export * from './campaign'
export * from './activity'
export * from './exchange'
export * from './institutional'
export * from './liquidityProvision'
