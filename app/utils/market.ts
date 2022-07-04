import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketCategoryType, MarketQuoteType, MarketRoute } from '~/types'
import {
  experimentalMarketsSlug,
  slugsToIncludeInCosmosCategory,
  slugsToExcludeFromEthereumCategory,
  upcomingMarkets,
  deprecatedMarkets
} from '~/app/data/market'
import { USDT_COIN_GECKO_ID } from '~/app/utils/constants'

export const getMarketRoute = (
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): MarketRoute | undefined => {
  if (upcomingMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: 'market-market',
      params: {
        marketId: market.marketId,
        market: market.slug
      }
    }
  }

  if (deprecatedMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: 'market-market',
      params: {
        marketId: market.marketId,
        market: market.slug
      }
    }
  }

  if (market.type === MarketType.Derivative) {
    if (market.subType === MarketType.BinaryOptions) {
      return {
        name: 'binary-options-binaryOption',
        params: {
          marketId: market.marketId,
          binaryOption: market.slug
        }
      }
    }

    if (market.subType === MarketType.Perpetual) {
      return {
        name: 'perpetuals-perpetual',
        params: {
          marketId: market.marketId,
          perpetual: market.slug
        }
      }
    }

    /* TODO - Expiry Futures */
    return {
      name: 'derivatives-derivative',
      params: {
        marketId: market.marketId,
        derivative: market.slug
      }
    }
  }

  if (market.type === MarketType.Spot) {
    return {
      name: 'spot-spot',
      params: {
        marketId: market.marketId,
        spot: market.slug
      }
    }
  }
}

export const getAbbreviatedVolume = (value: BigNumberInBase): string => {
  const thousand = 1000
  const million = 1000000
  const billion = 1000000000

  if (value.gt(billion)) {
    return `${value
      .dividedBy(billion)
      .toFormat(2, BigNumberInBase.ROUND_DOWN)}B`
  }

  if (value.gt(million)) {
    return `${value
      .dividedBy(million)
      .toFormat(2, BigNumberInBase.ROUND_DOWN)}M`
  }

  if (value.gt(thousand)) {
    return `${value
      .dividedBy(thousand)
      .toFormat(2, BigNumberInBase.ROUND_DOWN)}K`
  }

  return value.toFormat(2, BigNumberInBase.ROUND_DOWN)
}

export const marketIsPartOfCategory = (
  activeCategory: MarketCategoryType,
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): boolean => {
  if (activeCategory === MarketCategoryType.All) {
    return true
  }

  if (activeCategory === MarketCategoryType.Cosmos) {
    return (
      market.baseToken.denom.startsWith('ibc') ||
      market.quoteToken.denom.startsWith('ibc') ||
      slugsToIncludeInCosmosCategory.includes(market.slug)
    )
  }

  if (activeCategory === MarketCategoryType.Ethereum) {
    return (
      !market.baseToken.denom.startsWith('ibc') &&
      !market.quoteToken.denom.startsWith('ibc') &&
      !slugsToExcludeFromEthereumCategory.includes(market.slug)
    )
  }

  if (activeCategory === MarketCategoryType.Experimental) {
    return experimentalMarketsSlug.includes(market.slug)
  }

  return true
}

export const marketIsQuotePair = (
  activeQuote: MarketQuoteType,
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): boolean => {
  if (activeQuote === MarketQuoteType.All) {
    return true
  }

  if (activeQuote === MarketQuoteType.USDT) {
    return [
      market.quoteToken.coinGeckoId,
      market.baseToken.coinGeckoId
    ].includes(USDT_COIN_GECKO_ID)
  }

  return true
}

export const marketIsPartOfType = ({
  activeType,
  market,
  favoriteMarkets
}: {
  activeType: MarketType
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
  favoriteMarkets: string[]
}): boolean => {
  if (activeType.trim() === '') {
    return true
  }

  if (activeType === MarketType.Favorite) {
    return favoriteMarkets.includes(market.marketId)
  }

  return [market.type, market.subType].includes(activeType as MarketType)
}

export const marketIsPartOfSearch = (
  search: string,
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): boolean => {
  const query = search.trim().toLowerCase()

  if (query === '') {
    return true
  }

  return (
    market.quoteToken.symbol.toLowerCase().startsWith(query) ||
    market.baseToken.symbol.toLowerCase().startsWith(query) ||
    market.ticker.toLowerCase().startsWith(query)
  )
}
