import { MarketBase, UiSpotMarketWithToken } from '@injectivelabs/ui-common'

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

export const promotedMarketSlugs = [
  'huahua-usdt',
  'luna-ust',
  'luna-ust-perp',
  'ust-usdt',
  'atom-usdt',
  'ape-usdt'
]

export const excludedPriceDeviationSlugs = ['bayc-weth-perp'] as string[]

export const upcomingMarkets = [
  {
    marketId: 'ape-spot-market-id',
    marketStatus: 'active',
    ticker: 'APE/USDT',
    baseDenom: 'peggy0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    quoteDenom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
    quoteToken: {
      denom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
      logo: '/vendor/@injectivelabs/token-metadata/usdt.svg',
      symbol: 'USDT',
      name: 'USDT',
      decimals: 6,
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      coinGeckoId: 'tether'
    },
    baseToken: {
      denom: 'peggy0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      logo: '/vendor/@injectivelabs/token-metadata/ape.png',
      symbol: 'APE',
      name: 'ApeCoin',
      decimals: 18,
      address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      coinGeckoId: 'apecoin'
    },
    makerFeeRate: '0.001',
    takerFeeRate: '0.002',
    serviceProviderFee: '0.4',
    minPriceTickSize: 1e-15,
    minQuantityTickSize: 1000000000000000,
    slug: 'ape-usdt',
    type: 'Spot',
    subType: 'Spot',
    priceDecimals: 3,
    quantityDecimals: 3,
    upcoming: true
  } as UiSpotMarketWithToken
]
