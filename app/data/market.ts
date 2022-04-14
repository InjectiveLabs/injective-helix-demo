import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'

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
  'bayc-weth-perp',
  'ape-usdt',
  'luna-ust',
  'luna-ust-perp',
  'huahua-usdt',
  'ust-usdt'
]

export const innovationMarketsSlug = ['ape-usdt', 'huahua-usdt', 'gf-usdt']

export const excludedPriceDeviationSlugs = ['bayc-weth-perp'] as string[]

export const upcomingMarkets = [
  //
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>
