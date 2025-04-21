import { injToken } from '@shared/data/token'
import { IS_DEVNET, IS_TESTNET } from '@shared/utils/constant'
import type { UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const marketsToHideFromSelection: string[] = []

export const rwaMarketsInIAssets: string[] = [
  '0x0160a0c8ecbf5716465b9fc22bceeedf6e92dcdc688e823bbe1af3b22a84e5b5', // XAU-USDT-PERP
  '0xedc48ec071136eeb858b11ba50ba87c96e113400e29670fecc0a18d588238052' // XAG-USDT-PERP
]

export const betaMarketSlugs = [] as string[]
export const excludedPriceDeviationSlugs = [] as string[]

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET ? [] : ([] as Array<UiMarketWithToken>)

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [injToken.denom]

export const SETTLED_PERP_MARKETS_LAST_PRICE = {} as {
  [key: string]: undefined | { price?: string; denom?: string }
}
