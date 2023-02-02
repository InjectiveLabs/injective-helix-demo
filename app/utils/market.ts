import {
  UiDerivativeMarketWithToken,
  UiMarketHistory,
  UiSpotMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import { ExpiryFuturesMarket } from '@injectivelabs/sdk-ts'
import {
  DefaultMarket,
  MarketCategoryType,
  MarketQuoteType,
  MarketRoute
} from '@/types'
import {
  experimentalMarketsSlug,
  slugsToIncludeInCosmosCategory,
  slugsToExcludeFromEthereumCategory,
  upcomingMarkets,
  deprecatedMarkets
} from '@/app/data/market'
import { USDT_COIN_GECKO_ID, USDC_COIN_GECKO_ID } from '@/app/utils/constants'

export const getMarketRoute = (
  market: UiDerivativeMarketWithToken | UiSpotMarketWithToken
): MarketRoute => {
  if (upcomingMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: 'market-market',
      params: {
        market: market.slug
      }
    }
  }

  if (deprecatedMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: 'market-market',
      params: {
        market: market.slug
      }
    }
  }

  if (market.type === MarketType.Derivative) {
    if (market.subType === MarketType.BinaryOptions) {
      return {
        name: 'binary-options-binaryOption',
        params: {
          binaryOption: market.slug
        }
      }
    }

    if ([MarketType.Perpetual, MarketType.Futures].includes(market.subType)) {
      return {
        name: 'futures-futures',
        params: {
          futures: market.slug
        }
      }
    }

    /* Default derivative market route */
    return {
      name: 'derivatives-derivative',
      params: {
        derivative: market.slug
      }
    }
  }

  if (market.type === MarketType.Spot) {
    return {
      name: 'spot-spot',
      params: {
        spot: market.slug
      }
    }
  }

  return {
    name: 'market-market',
    params: {
      market: market.slug
    }
  }
}

export const getDefaultPerpetualMarketRoute = () => {
  return {
    to: {
      name: 'futures-futures',
      params: {
        futures: DefaultMarket.Perpetual
      }
    }
  }
}

export const getDefaultSpotMarketRoute = () => {
  return {
    to: {
      name: 'spot-spot',
      params: {
        spot: DefaultMarket.Spot
      }
    }
  }
}

export const getDefaultPerpetualMarketRouteParams = () => {
  return {
    name: 'futures-futures',
    params: {
      futures: DefaultMarket.Perpetual
    }
  }
}

export const getDefaultSpotMarketRouteParams = () => {
  return {
    name: 'spot-spot',
    params: {
      spot: DefaultMarket.Spot
    }
  }
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

  if (activeQuote === MarketQuoteType.USDC) {
    return [
      market.quoteToken.coinGeckoId,
      market.baseToken.coinGeckoId
    ].includes(USDC_COIN_GECKO_ID)
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

export const getFormattedMarketsHistoryChartData = (
  marketsHistory: UiMarketHistory
) => {
  return marketsHistory.time.map((time, index, times) => {
    const totalPrice =
      marketsHistory.openPrice[index] +
      marketsHistory.highPrice[index] +
      marketsHistory.lowPrice[index] +
      marketsHistory.closePrice[index]

    const yAxisHolcAveragePrice = new BigNumberInBase(totalPrice)
      .dividedBy(4)
      .toNumber()

    const xAxisTime = time - times[0]

    return [xAxisTime, yAxisHolcAveragePrice]
  })
}

export const marketHasRecentlyExpired = (market: ExpiryFuturesMarket) => {
  const now = Date.now() / 1000
  const secondsInADay = SECONDS_IN_A_DAY.toNumber()

  if (!market) {
    return false
  }

  if (!market.expiryFuturesMarketInfo) {
    return false
  }

  if (!market.expiryFuturesMarketInfo.expirationTimestamp) {
    return false
  }

  const isExpired = market.expiryFuturesMarketInfo.expirationTimestamp <= now

  if (!isExpired) {
    return false
  }

  return (
    market.expiryFuturesMarketInfo.expirationTimestamp + secondsInADay > now
  )
}
