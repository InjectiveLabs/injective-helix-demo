import { injToken } from '@shared/data/token'
import marketCategorySlugs from './category.json'
import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants'
import { NotLiquidMarket, MarketPromotion, UiMarketWithToken } from '@/types'

export interface UnTradableMarket {
  slug: string
}

export const betaMarketSlugs = [] as string[]

export const newMarketsSlug = marketCategorySlugs.newMarketsCategorySlugs || []

export const experimentalMarketsSlug =
  marketCategorySlugs.experimentalCategorySlugs || []

export const slugsToIncludeInCosmosCategory =
  marketCategorySlugs.cosmosCategorySlugs || []

export const slugsToIncludeInEthereumCategory =
  marketCategorySlugs.ethereumCategorySlugs || []

export const slugsToIncludeInInjectiveCategory =
  marketCategorySlugs.injectiveCategorySlugs || []

export const slugsToIncludeInSolanaCategory =
  marketCategorySlugs.solanaCategorySlugs || []

export const olpSlugsToIncludeInLowVolume =
  marketCategorySlugs.olpLowVolumeCategorySlugs || []

export const excludedPriceDeviationSlugs = [] as string[]

export const upcomingMarkets = [
  //
] as Array<UiMarketWithToken>

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

export const QUOTE_DENOMS_TO_SHOW_USD_VALUE: string[] = [injToken.denom]

export const SETTLED_PERP_MARKETS_LAST_PRICE = {} as {
  [key: string]: { price?: string; denom?: string } | undefined
}

export enum MarketTheme {
  Memes = 'memes',
  L1L2 = 'l1l2',
  Infrastructure = 'infrastructure',
  DefiDex = 'defi-dex',
  NFT = 'nft',
  LiquidStaking = 'liquid-staking',
  Stablecoins = 'stablecoins'
}

export const MARKET_THEMES_SLUGS = {
  [MarketTheme.Memes]: ['ninja-inj', 'nonja-inj'],
  [MarketTheme.L1L2]: ['weth-usdt', 'btc-usdt-perp', 'inj-usdt'],
  [MarketTheme.Infrastructure]: ['pyth-usdt-perp'],
  [MarketTheme.DefiDex]: ['sol-usdt'],
  [MarketTheme.NFT]: ['talis-inj'],
  [MarketTheme.LiquidStaking]: ['hdro-inj', 'hinj/inj'],
  [MarketTheme.Stablecoins]: ['usdc-usdt', 'usde-usdt']
}
