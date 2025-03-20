import { injToken } from '@shared/data/token'
import { IS_DEVNET, IS_TESTNET } from '@shared/utils/constant'
import { marketCategoriesMap } from '@/app/json'
import { NotLiquidMarket, MarketPromotion, UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]

export const rwaMarketIds = marketCategoriesMap.rwa || []
export const newMarketsMarketIds = marketCategoriesMap.newMarkets || []

export const excludedPriceDeviationSlugs = [] as string[]
export const marketIdsToHide = [] as string[]

// todo: refactor/re-implement this functionality when we have a use case in the future
export const upcomingMarkets = [
  //
] as Array<UiMarketWithToken>

export const deprecatedMarkets =
  IS_DEVNET || IS_TESTNET ? [] : ([] as Array<UiMarketWithToken>)

export const notLiquidMarkets = [
  {
    slug: 'sol-usdcet',
    redirectionSlug: 'sol-usdt'
  }
] as NotLiquidMarket[]

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

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [injToken.denom]

export const SETTLED_PERP_MARKETS_LAST_PRICE = {} as {
  [key: string]: { price?: string; denom?: string } | undefined
}

export const RWA_TRADFI_MARKET_IDS = [
  '0x2236b4cd97300c79fca5c2fff4b647ab24a6d48c1554255ff8ec7cf29429ba74', // tradfi-usdt-perp
  '0x37d4e69a77cdca055615d55c088d5bdf1bc75801e2c00a925e0b2dae62b5d660', // tti-usdt-perp
  '0x056fd86c5b8bde4a4f03552e281db86fc6c110a13a79b98b2011aa84bb0ec340', // imcd-usdt-perp
  '0x1e8369b298705c468c1a313a729bae0dbd4410587465cc69276bf8ba4e0231c1' // invda-usdt-perp
]
