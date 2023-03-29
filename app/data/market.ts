import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants'
import { MarketPromotion, UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]

export const newMarketsSlug = [
  'gbp-usdt-perp',
  'jpy-usdt-perp',
  'eur-usdt-perp',
  'arb-usdt',
  'chz-usdcet',
  'canto-usdt',
  'sol-usdcet',
  'atom-usdt-perp',
  'usdc-usdcet',
  'strd-usdt'
]

export const experimentalMarketsSlug = [
  'ape-usdt',
  'gf-usdt',
  'eth-usdt-19sep22',
  'ethbtctrend-usdt',
  'steadyeth-usdt',
  'steadybtc-usdt'
]

export const slugsToIncludeInCosmosCategory = [
  'inj-usdt',
  'cre-usdt',
  'somm-usdt',
  'canto-usdt',
  'strd-usdt',
  'inj-usdt-perp',
  'osmo-usdt-perp'
]

export const slugsToExcludeFromEthereumCategory = [
  ...slugsToIncludeInCosmosCategory,
  'arb-usdt',
  'btc-usdt-perp',
  'link-usdt',
  'link-usdt-perp'
]

export const excludedPriceDeviationSlugs = [] as string[]

export const upcomingMarkets = [
  //
] as Array<UiMarketWithToken>

export const deprecatedMarketSlugs = IS_DEVNET || IS_TESTNET ? [] : []

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
