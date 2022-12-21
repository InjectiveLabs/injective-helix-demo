import {
  MarketBase,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { IS_DEVNET, IS_TESTNET } from '~/app/utils/constants'
import { MarketPromotion } from '~/types'

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
  'somm-usdt',
  'cre-usdt',
  'strd-usdt',
  'ethbtctrend-usdt',
  'steadyeth-usdt',
  'steadybtc-usdt'
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
  'strd-usdt',
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

export const marketPromotions = [
  {
    market: 'cre-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/5955316975503-Decentralized-Crescent-CRE-Spot-Market-Listing-on-Helix-with-50-000-CRE-in-Prizes',
    start: 1669766400000,
    end: 1672358400000
  },
  {
    market: 'somm-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671753600000
  },
  {
    market: 'steadybtc-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671753600000
  },
  {
    market: 'steadyeth-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671753600000
  },
  {
    market: 'ethbtctrend-usdt',
    url: 'https://helixapp.zendesk.com/hc/en-us/articles/6039996722575-Sommelier-SOMM-and-Strategy-Tokens-Listing-on-Helix-with-100-000-in-SOMM-Rewards',
    start: 1670889600000,
    end: 1671753600000
  }
] as MarketPromotion[]
