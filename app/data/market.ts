import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import {
  BAYC_WETH_PERP_SLUG,
  IS_DEVNET,
  IS_TESTNET
} from '~/app/utils/constants'

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
  'dot-usdt',
  'stx-usdt-perp',
  'xprt-usdt',
  'evmos-usdt',
  BAYC_WETH_PERP_SLUG
]

export const experimentalMarketsSlug = [
  BAYC_WETH_PERP_SLUG,
  'ape-usdt',
  'gf-usdt'
]

export const slugsToIncludeInCosmosCategory = ['inj-usdt', 'inj-usdt-perp']
export const slugsToExcludeFromEthereumCategory = [
  ...slugsToIncludeInCosmosCategory,
  'btc-usdt',
  'btc-usdt-perp',
  'link-usdt',
  'link-usdt-perp'
]

export const excludedPriceDeviationSlugs = ['bayc-weth-perp'] as string[]

export const upcomingMarkets = [
  //
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>

export const deprecatedMarketSlugs = IS_DEVNET || IS_TESTNET ? [] : []

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET
    ? []
    : ([] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>)
