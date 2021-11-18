import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { getCoinGeckoId, getTokenMetaDataWithIbc } from '../services/tokens'
import { grpcTokenMetaToToken, tokenMetaToToken } from './token'
import { getDecimalsFromNumber } from '~/app/utils/helpers'
import { spot as sortSpotMarkets } from '~/routes.config'
import {
  BaseUiSpotMarket,
  UiSpotMarket,
  SpotOrderSide,
  SpotMarketMap,
  UiSpotMarketSummary,
  BaseUiSpotMarketWithPartialTokenMetaData,
  BaseUiSpotMarketWithTokenMetaData,
  MarketType,
  Change
} from '~/types'
import { filteredMarkets as filterSpotMarkets } from '~/components/partials/spot/filter'

export const spotMarketToUiSpotMarket = (
  market: BaseUiSpotMarketWithTokenMetaData
): UiSpotMarket => {
  return {
    ...market,
    type: MarketType.Spot,
    subType: MarketType.Spot,
    priceDecimals: getDecimalsFromNumber(
      new BigNumberInWei(market.minPriceTickSize)
        .toBase(market.quoteToken.decimals - market.baseToken.decimals)
        .toNumber()
    ),
    quantityDecimals: getDecimalsFromNumber(
      new BigNumberInBase(market.minQuantityTickSize)
        .toWei(-market.baseToken.decimals)
        .toNumber()
    )
  }
}

export const baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData = async (
  market: BaseUiSpotMarket
): Promise<BaseUiSpotMarketWithPartialTokenMetaData> => {
  const slug = market.ticker.replace('/', '-').replace(' ', '-').toLowerCase()
  const baseToken = market.baseToken
    ? grpcTokenMetaToToken(market.baseToken, market.baseDenom)
    : tokenMetaToToken(
        await getTokenMetaDataWithIbc(market.baseDenom),
        market.baseDenom
      )
  const quoteToken = market.quoteToken
    ? grpcTokenMetaToToken(market.quoteToken, market.quoteDenom)
    : tokenMetaToToken(
        await getTokenMetaDataWithIbc(market.quoteDenom),
        market.quoteDenom
      )

  if (baseToken && !baseToken.coinGeckoId) {
    baseToken.coinGeckoId = getCoinGeckoId(baseToken.symbol)
  }

  if (quoteToken && !quoteToken.coinGeckoId) {
    quoteToken.coinGeckoId = getCoinGeckoId(quoteToken.symbol)
  }

  return {
    ...market,
    slug,
    baseToken,
    quoteToken
  }
}

export const spotMarketsToUiSpotMarkets = async (
  markets: BaseUiSpotMarket[]
): Promise<UiSpotMarket[]> => {
  const tokenMetaDataExists = (m: BaseUiSpotMarketWithPartialTokenMetaData) =>
    m.baseToken !== undefined && m.quoteToken !== undefined
  const filteredMarkets = (
    await Promise.all(
      markets.map(baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData)
    )
  )
    .filter(tokenMetaDataExists)
    .filter((market) => sortSpotMarkets.includes(market.slug))
    .filter(
      (market) => !filterSpotMarkets.includes(market.slug)
    ) as BaseUiSpotMarketWithTokenMetaData[]

  const mappedMarkets = filteredMarkets.map((m) => spotMarketToUiSpotMarket(m))

  mappedMarkets.sort(function (a, b) {
    return sortSpotMarkets.indexOf(a.slug) - sortSpotMarkets.indexOf(b.slug)
  })

  return mappedMarkets
}

export const marketSummaryToUiMarketSummary = (
  oldSummary: UiSpotMarketSummary,
  newSummary: UiSpotMarketSummary
): UiSpotMarketSummary => {
  return {
    ...newSummary,
    lastPrice: oldSummary.price,
    lastPriceChange: new BigNumber(oldSummary.price).eq(newSummary.price)
      ? oldSummary.lastPriceChange || Change.NoChange
      : new BigNumber(newSummary.price).gte(oldSummary.price)
      ? Change.Increase
      : Change.Decrease
  }
}

export const marketsSummaryToUiMarketsSummary = (
  oldSummaries: UiSpotMarketSummary[] = [],
  newSummaries: UiSpotMarketSummary[] = []
): UiSpotMarketSummary[] => {
  return oldSummaries.map((oldSummary) => {
    const newSummary = newSummaries.find(
      (m) => m.marketId === oldSummary.marketId
    )

    // Sometimes, chronos returns zeros
    const actualNewSummary =
      newSummary && newSummary.price ? newSummary : oldSummary

    return marketSummaryToUiMarketSummary(oldSummary, actualNewSummary)
  })
}

export const orderTypeToGrpcOrderType = (
  orderType: SpotOrderSide
): SpotMarketMap => {
  switch (orderType) {
    case SpotOrderSide.Unspecified:
      return SpotMarketMap.UNSPECIFIED
    case SpotOrderSide.Buy:
      return SpotMarketMap.BUY
    case SpotOrderSide.Sell:
      return SpotMarketMap.SELL
    case SpotOrderSide.StopBuy:
      return SpotMarketMap.STOP_BUY
    case SpotOrderSide.TakeBuy:
      return SpotMarketMap.TAKE_BUY
    case SpotOrderSide.TakeSell:
      return SpotMarketMap.TAKE_SELL
    default:
      return SpotMarketMap.BUY
  }
}
