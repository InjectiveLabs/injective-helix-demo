import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { BAYC_WETH_PERP_SLUG } from '~/app/utils/constants'

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
  BAYC_WETH_PERP_SLUG,
  'ape-usdt',
  'luna-ust',
  'luna-ust-perp',
  'evmos-usdt',
  'ust-usdt'
]

export const experimentalMarketsSlug = [
  BAYC_WETH_PERP_SLUG,
  'ape-usdt',
  'huahua-usdt',
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
