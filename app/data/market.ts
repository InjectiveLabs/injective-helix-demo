import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { BAYC_WETH_PERP_SLUG } from '~/app/utils/constants'

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
  'osmo-ust-perp',
  'xprt-usdt',
  'evmos-usdt',
  BAYC_WETH_PERP_SLUG,
  'ape-usdt',
  'luna-ust',
  'luna-ust-perp'
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

export const deprecatedMarketSlugs = [
  'huahua-usdt',
  'luna-ust',
  'luna-ust-perp'
]

export const upcomingMarkets = [
  //
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>

export const deprecatedMarkets = [
  {
    oracleBase: 'LUNA',
    oracleQuote: 'UST',
    oracleType: 'bandibc',
    initialMarginRatio: '0.095',
    maintenanceMarginRatio: '0.05',
    isPerpetual: true,
    marketId:
      '0x8158e603fb80c4e417696b0e98765b4ca89dcf886d3b9b2b90dc15bfb1aebd51',
    marketStatus: 'active',
    ticker: 'LUNA/UST PERP',
    quoteDenom:
      'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C',
    quoteToken: {
      denom:
        'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C',
      logo: '/vendor/@injectivelabs/token-metadata/ust.png',
      symbol: 'UST',
      name: 'TerraUSD',
      decimals: 6,
      address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
      coinGeckoId: 'terrausd'
    },
    makerFeeRate: '0.0005',
    takerFeeRate: '0.0012',
    serviceProviderFee: '0.4',
    minPriceTickSize: 10000,
    minQuantityTickSize: 0.1,
    perpetualMarketInfo: {
      hourlyFundingRateCap: '0.0000625',
      hourlyInterestRate: '0.00000416666',
      nextFundingTimestamp: 1652428800,
      fundingInterval: 3600
    },
    perpetualMarketFunding: {
      cumulativeFunding: '21387072.464953802708258522',
      cumulativePrice: '-1398.14929995757318341',
      lastTimestamp: 1652405310
    },
    expiryFuturesMarketInfo: '__vue_devtool_undefined__',
    slug: 'luna-ust-perp',
    baseToken: {
      denom: 'luna',
      logo: '/vendor/@injectivelabs/token-metadata/luna.png',
      symbol: 'LUNA',
      name: 'Terra',
      decimals: 6,
      address: '0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9',
      coinGeckoId: 'terra-luna'
    },
    type: 'Derivative',
    subType: 'Perpetual',
    quantityDecimals: 1,
    priceDecimals: 2
  },
  {
    marketId:
      '0xdce84d5e9c4560b549256f34583fb4ed07c82026987451d5da361e6e238287b3',
    marketStatus: 'active',
    ticker: 'LUNA/UST',
    baseDenom:
      'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395',
    quoteDenom:
      'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C',
    quoteToken: {
      denom:
        'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C',
      logo: '/vendor/@injectivelabs/token-metadata/ust.png',
      symbol: 'UST',
      name: 'TerraUSD',
      decimals: 6,
      address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
      coinGeckoId: 'terrausd'
    },
    baseToken: {
      denom:
        'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395',
      logo: '/vendor/@injectivelabs/token-metadata/luna.png',
      symbol: 'LUNA',
      name: 'Terra',
      decimals: 6,
      address: '0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9',
      coinGeckoId: 'terra-luna'
    },
    makerFeeRate: '0.0005',
    takerFeeRate: '0.0012',
    serviceProviderFee: '0.4',
    minPriceTickSize: 0.01,
    minQuantityTickSize: 100000,
    slug: 'luna-ust',
    type: 'Spot',
    subType: 'Spot',
    priceDecimals: 2,
    quantityDecimals: 1
  },
  {
    marketId:
      '0xf04d1b7acf40b331d239fcff7950f98a4f2ab7adb2ceb8f65aa32ac29455d7b4',
    marketStatus: 'active',
    ticker: 'HUAHUA/USDT',
    baseDenom:
      'ibc/E7807A46C0B7B44B350DA58F51F278881B863EC4DCA94635DAB39E52C30766CB',
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
      denom:
        'ibc/E7807A46C0B7B44B350DA58F51F278881B863EC4DCA94635DAB39E52C30766CB',
      logo: '/vendor/@injectivelabs/token-metadata/chihuahua.jpeg',
      symbol: 'HUAHUA',
      name: 'Chihuahua',
      decimals: 6,
      address: '',
      coinGeckoId: 'chihuahua-token'
    },
    makerFeeRate: '0.001',
    takerFeeRate: '0.001',
    serviceProviderFee: '0.4',
    minPriceTickSize: 0.000001,
    minQuantityTickSize: 100000000,
    slug: 'huahua-usdt',
    type: 'Spot',
    subType: 'Spot',
    priceDecimals: 4,
    quantityDecimals: 0,
    upcoming: true
  }
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>
