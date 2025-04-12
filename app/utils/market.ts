import { SharedMarketType } from '@shared/types'
import { BigNumberInBase, SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import { deprecatedMarkets } from '@/app/data/market'
import { TradeSubPage } from '@/types'
import type { SharedUiMarketHistory } from '@shared/types'
import type { MarketRoute, UiMarketWithToken } from '@/types'
import type {
  PriceLevel,
  DerivativeMarket,
  ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'

interface PriceLevelMap {
  [price: string]: PriceLevel
}

export const getMarketRoute = (market: UiMarketWithToken): MarketRoute => {
  if (deprecatedMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: TradeSubPage.Market,
      params: {
        market: market.slug
      }
    }
  }

  if (market.type === SharedMarketType.Derivative) {
    if (
      [SharedMarketType.Futures, SharedMarketType.Perpetual].includes(
        market.subType
      )
    ) {
      return {
        name: TradeSubPage.Futures,
        params: {
          slug: market.slug
        }
      }
    }

    /* Default derivative market route */
    return {
      name: TradeSubPage.Derivatives,
      params: {
        derivative: market.slug
      }
    }
  }

  if (market.type === SharedMarketType.Spot) {
    return {
      name: TradeSubPage.Spot,
      params: {
        slug: market.slug
      }
    }
  }

  return {
    name: TradeSubPage.Market,
    params: {
      market: market.slug
    }
  }
}

export const getFormattedMarketsHistoryChartData = (
  marketsHistory: SharedUiMarketHistory
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

export const marketIsInactive = (market: DerivativeMarket) => {
  const HIDDEN_MARKET_TICKERS = [
    'LUNA/UST PERP',
    'STX/USDT PERP',
    'BAYC/WETH PERP',
    'OSMO/USDT PERP',
    'ETH/USDT 19SEP22',
    'BONK/USDT PERP',
    '1000PEPE/USDT PERP',
    'TIA/USDT-30NOV2023',
    'ETH/USDTkv PERP',
    'BTC/USDTkv PERP'
  ]

  return !HIDDEN_MARKET_TICKERS.includes(market.ticker)
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
    market.expiryFuturesMarketInfo.expirationTimestamp + secondsInADay * 7 > now
  )
}

/**
 * 1. if new exists in current, update quantity in current,
 * 2. if new exists in current and quantity is 0, delete from current
 * 3. If new doesn't exist in current, add to current
 **/
export const updateOrderbookRecord = (
  currentRecords: PriceLevel[] = [],
  updatedRecords: PriceLevel[] = []
) => {
  const currentRecordsMap: PriceLevelMap = currentRecords.reduce(
    (currentRecordsMap, record) => {
      currentRecordsMap[record.price] = record

      return currentRecordsMap
    },
    {} as PriceLevelMap
  )

  updatedRecords.forEach((record) => {
    currentRecordsMap[record.price] = record
  })

  return Object.values(currentRecordsMap).filter((record) =>
    new BigNumberInBase(record.quantity).gt(0)
  )
}

export const combineOrderbookRecords = ({
  isBuy,
  updatedRecords = [],
  currentRecords = []
}: {
  isBuy: boolean
  updatedRecords?: PriceLevel[]
  currentRecords?: PriceLevel[]
}) => {
  const combinedOrderbookRecords = updateOrderbookRecord(
    currentRecords,
    updatedRecords
  )

  return combinedOrderbookRecords.sort((a, b) => {
    return isBuy
      ? new BigNumberInBase(b.price).minus(a.price).toNumber()
      : new BigNumberInBase(a.price).minus(b.price).toNumber()
  })
}
