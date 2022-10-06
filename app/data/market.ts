import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { IS_DEVNET, IS_TESTNET } from '~/app/utils/constants'

export interface UnTradableMarket {
  slug: string
}

export const marketBase = {
  [MarketBase.Terra]: ['UST', 'LUNA']
}

export const marketBaseFromTicker = (
  ticker: string
): MarketBase | undefined => {
  const keys = Object.keys(marketBase) as MarketBase[]

  for (const key of keys) {
    const symbols = marketBase[key]

    for (const symbol of symbols) {
      if (ticker.includes(symbol)) {
        return key
      }
    }
  }

  return undefined
}

export const betaMarketSlugs = [] as string[]

export const newMarketsSlug = [
  'strd-usdt',
  'usdc-usdt',
  'osmo-usdt-perp',
  'dot-usdt',
  'stx-usdt-perp',
  'xprt-usdt'
]

export const experimentalMarketsSlug = [
  'ape-usdt',
  'gf-usdt',
  'eth-usdt-19sep22'
]

export const slugsToIncludeInCosmosCategory = [
  'inj-usdt',
  'inj-usdt-perp',
  'osmo-usdt-perp'
]
export const slugsToExcludeFromEthereumCategory = [
  ...slugsToIncludeInCosmosCategory,
  'btc-usdt',
  'btc-usdt-perp',
  'link-usdt',
  'link-usdt-perp'
]

export const excludedPriceDeviationSlugs = [] as string[]

export const upcomingMarkets = [
  //
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>

export const deprecatedMarketSlugs = IS_DEVNET || IS_TESTNET ? [] : []

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET
    ? []
    : ([] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>)

export const derivativeMarketRouteNames = [
  'perpetuals-perpetual',
  'futures-futures',
  'binary-options-binaryOption',
  'derivatives-derivative'
]
export const spotMarketRouteNames = ['spot-spot']
