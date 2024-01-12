import { INJ_DENOM } from '@injectivelabs/utils'
import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants'
import { NotLiquidMarket, MarketPromotion, UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]

export const newMarketsSlug = [
  'app-inj',
  'ninj-inj',
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
  'app-inj',
  'gf-usdt',
  'autism-inj',
  'tia-usdt-30nov2023',
  '1000pepe-usdt-perp',
  'eth-usdt-19sep22',
  'ethbtctrend-usdt',
  'steadyeth-usdt',
  'steadybtc-usdt',
  'app-inj',
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
  'app-inj',
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

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [INJ_DENOM]
