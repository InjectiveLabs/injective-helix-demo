import { INJ_DENOM } from '@injectivelabs/utils'
import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants'
import {
  NotLiquidMarket,
  MarketPromotion,
  UiMarketWithToken,
  SymbolWithMarketId
} from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]

export const newMarketsSlug = [
  'talis-usdt',
  'pyth-usdt',
  'kuji-usdt',
  'tia-usdt-perp',
  'sei-usdt-perp',
  'whale-usdt',
  'pyth-usdt-perp',
  'usdy-usdt',
  'tia-usdt',
  'btc-usdtkv-perp',
  'eth-usdtkv-perp'
]

export const experimentalMarketsSlug = [
  'usdy-usdt',
  'ape-usdt',
  'gf-usdt',
  'tia-usdt-30nov2023',
  '1000pepe-usdt-perp',
  'eth-usdt-19sep22',
  'ethbtctrend-usdt',
  'steadyeth-usdt',
  'steadybtc-usdt',
  'ninja-inj',
  'kira-inj',
  'katana-inj'
]

export const slugsToIncludeInCosmosCategory = [
  'inj-usdt',
  'cre-usdt',
  'tia-usdt',
  'stinj-inj',
  'somm-usdt',
  'canto-usdt',
  'strd-usdt',
  'inj-usdt-perp',
  'osmo-usdt-perp',
  'atom-usdt-perp',
  'sei-usdt-perp',
  'axl-usdt-perp',
  'tia-usdt-30nov2023',
  'tia-usdt-perp',
  'talis-usdt'
]

export const slugsToIncludeInEthereumCategory = [
  'usdy-usdt',
  'inj-usdt',
  'arb-usdt',
  'chz-usdcet',
  'usdt-usdcet',
  'ape-usdt',
  'link-usdt',
  'stinj-inj',
  'weth-usdt',
  'evmos-usdt',
  'gf-usdt',
  'wmatic-usdt',
  'ethbtctrend-usdt',
  'steadyeth-usdt',
  'steadybtc-usdt',
  'inj-usdt-perp',
  'bonk-usdt-perp',
  'eth-usdt-perp',
  'bnb-usdt-perp',
  'stx-usdt-perp',
  'eth-usdtkv-perp'
]

export const olpSlugsToIncludeInLowVolume = [
  'inj-usdt',
  'tia-usdt',
  'xrp-usdt-perp',
  'atom-usdt',
  'weth-usdt',
  'usdt-usdcet',
  'wmatic-usdt',
  '1000pepe-usdt-perp',
  'atom-usdt-perp',
  'btc-usdt-perp',
  'eth-usdt-perp',
  'inj-usdt-perp',
  'bnb-usdt-perp',
  'pyth-usdt-perp',
  'sol-usdt',
  'axl-usdt-perp',
  'kava-usdt',
  'sei-usdt-perp',
  'tia-usdt-30nov2023',
  'tia-usdt-perp'
]

export const excludedPriceDeviationSlugs = [] as string[]

export const upcomingMarkets = [
  //
] as Array<UiMarketWithToken>

export const deprecatedMarketSlugs = IS_DEVNET || IS_TESTNET ? [] : []

export const notLiquidMarkets = [
  {
    slug: 'sol-usdcet',
    redirectionSlug: 'sol-usdt'
  }
] as NotLiquidMarket[]

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET ? [] : ([] as Array<UiMarketWithToken>)

export const marketPromotions = [
  {
    market: 'cre-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/5955316975503-Decentralized-Crescent-CRE-Spot-Market-Listing-on-Helix-with-50-000-CRE-in-Prizes',
    start: 1669766400000,
    end: 1672441200000
  },
  {
    market: 'somm-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671836400000
  },
  {
    market: 'steadybtc-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671836400000
  },
  {
    market: 'steadyeth-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671836400000
  },
  {
    market: 'ethbtctrend-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671836400000
  }
] as MarketPromotion[]

export const TALIS_METADATA = {
  symbol: 'TALIS',
  coingeckoId: 'talis'
}

export const MARKET_IDS_WITHOUT_COINGECKO_ID: SymbolWithMarketId[] = [
  {
    symbol: 'TALIS',
    marketId:
      '0x21f3eed62ddc64458129c0dcbff32b3f54c92084db787eb5cf7c20e69a1de033',
    coingeckoId: 'talis',
    isUsdtQuote: true,
    quoteMarket: ''
  },
  {
    symbol: 'NINJA',
    marketId:
      '0xdf9317eac1739a23bc385e264afde5d480c0b3d2322660b5efd206071d4e70b7',
    coingeckoId: 'ninja',
    isUsdtQuote: false,
    quoteMarket:
      '0xa508cb32923323679f29a032c70342c147c17d0145625922b0ef22e955c844c0'
  },
  {
    symbol: 'KIRA',
    marketId:
      '0x2d3b8d8833dda54a717adea9119134556848105fd6028e9a4a526e4e5a122a57',
    coingeckoId: 'kira',
    isUsdtQuote: false,
    quoteMarket:
      '0xa508cb32923323679f29a032c70342c147c17d0145625922b0ef22e955c844c0'
  },
  {
    symbol: 'KATANA',
    marketId:
      '0x4bb3426a2d7ba80c244ef7eecfd7c4fd177d78e63ff40ba6235b1ae471e23cdb',
    coingeckoId: 'katana',
    isUsdtQuote: false,
    quoteMarket:
      '0xa508cb32923323679f29a032c70342c147c17d0145625922b0ef22e955c844c0'
  }
]

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [INJ_DENOM]
