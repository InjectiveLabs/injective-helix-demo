import {
  UiDerivativeMarketWithToken,
  MarketType,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketCategoryType, MarketQuoteType, MarketRoute } from '~/types'
import {
  experimentalMarketsSlug,
  slugsToIncludeInCosmosCategory,
  slugsToExcludeFromEthereumCategory
} from '~/app/data/market'
import { USDT_COIN_GECKO_ID, UST_COIN_GECKO_ID } from '~/app/utils/constants'

export const getMarketRoute = (
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): MarketRoute | undefined => {
  if (market.type === MarketType.Derivative) {
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
    return `${value.dividedBy(billion).toFormat(2)}B`
  }

  if (value.gt(million)) {
    return `${value.dividedBy(million).toFormat(2)}M`
  }

  if (value.gt(thousand)) {
    return `${value.dividedBy(million).toFormat(2)}K`
  }

  return value.toFormat(2)
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

  if (activeQuote === MarketQuoteType.UST) {
    return [
      market.quoteToken.coinGeckoId,
      market.baseToken.coinGeckoId
    ].includes(UST_COIN_GECKO_ID)
  }

  return true
}

export const marketIsPartOfType = ({
  activeType,
  market,
  favoriteMarkets
}: {
  activeType: string
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
  favoriteMarkets: string[]
}): boolean => {
  if (activeType.trim() === '') {
    return true
  }

  if (activeType === MarketType.Favourite) {
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
