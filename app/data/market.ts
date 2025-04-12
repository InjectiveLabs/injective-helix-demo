import { injToken } from '@shared/data/token'
import { IS_DEVNET, IS_TESTNET } from '@shared/utils/constant'
import type { UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]
export const excludedPriceDeviationSlugs = [] as string[]

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET ? [] : ([] as Array<UiMarketWithToken>)

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [injToken.denom]

export const SETTLED_PERP_MARKETS_LAST_PRICE = {} as {
  [key: string]: undefined | { price?: string; denom?: string }
}
