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

export const deprecatedMarketSlugs = ['huahua-usdt']

export const upcomingMarkets = [
  //
] as Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken>

export const deprecatedMarkets = [
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
