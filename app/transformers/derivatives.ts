import { TokenMeta } from '@injectivelabs/derivatives-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Erc20TokenMeta } from '@injectivelabs/token-metadata'
import { peggyDenomToContractAddress } from './peggy'
import { getDecimalsFromNumber } from '~/app/utils/helpers'
import { sortPerpetualMarkets } from '~/components/partials/derivatives/sort'
import {
  BaseUiDerivativeMarket,
  UiDerivativeMarket,
  DerivativeOrderSide,
  DerivativeMarketMap,
  Token,
  UiDerivativeMarketSummary
} from '~/types'

export const derivativeMarketToUiDerivativeMarket = (
  market: BaseUiDerivativeMarket
): UiDerivativeMarket => {
  const slug = market.ticker.replace('/', '-').replace(' ', '-').toLowerCase()
  const [baseTokenSymbol] = slug.split('-')
  const baseTokenMeta = Erc20TokenMeta.getMeta(baseTokenSymbol)
  const quoteToken = tokenMetaToToken(market.quoteToken!, market.quoteDenom)

  return {
    ...market,
    quoteToken,
    baseTokenMeta,
    priceDecimals: getDecimalsFromNumber(
      new BigNumberInWei(market.minPriceTickSize)
        .toBase(quoteToken.decimals)
        .toNumber()
    ),
    quantityDecimals: getDecimalsFromNumber(market.minQuantityTickSize),
    slug: market.ticker.replace('/', '-').replace(' ', '-').toLowerCase()
  }
}

export const derivativeMarketsToUiDerivativeMarkets = (
  markets: BaseUiDerivativeMarket[] // Markets with quote token meta data
): UiDerivativeMarket[] => {
  const mappedMarkets = markets.map((m) =>
    derivativeMarketToUiDerivativeMarket(m)
  )

  mappedMarkets.sort(function (a, b) {
    return (
      sortPerpetualMarkets.indexOf(a.slug) -
      sortPerpetualMarkets.indexOf(b.slug)
    )
  })

  return mappedMarkets
}

export const marketSummaryToUiMarketSummary = (
  oldSummary: UiDerivativeMarketSummary,
  newSummary: UiDerivativeMarketSummary
): UiDerivativeMarketSummary => {
  return {
    ...newSummary,
    lastPrice: oldSummary.price
  }
}

export const marketsSummaryToUiMarketsSummary = (
  oldSummaries: UiDerivativeMarketSummary[] = [],
  newSummaries: UiDerivativeMarketSummary[] = []
): UiDerivativeMarketSummary[] => {
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

export const tokenMetaToToken = (
  tokenMeta: TokenMeta,
  denom: string
): Token => {
  return {
    symbol: tokenMeta.symbol,
    name: tokenMeta.name,
    icon: tokenMeta.logo,
    decimals: tokenMeta.decimals,
    address: peggyDenomToContractAddress(denom),
    denom
  }
}

export const orderTypeToGrpcOrderType = (
  orderType: DerivativeOrderSide
): DerivativeMarketMap => {
  switch (orderType) {
    case DerivativeOrderSide.Unspecified:
      return DerivativeMarketMap.UNSPECIFIED
    case DerivativeOrderSide.Buy:
      return DerivativeMarketMap.BUY
    case DerivativeOrderSide.Sell:
      return DerivativeMarketMap.SELL
    case DerivativeOrderSide.StopBuy:
      return DerivativeMarketMap.STOP_BUY
    case DerivativeOrderSide.StopSell:
      return DerivativeMarketMap.STOP_SELL
    case DerivativeOrderSide.TakeBuy:
      return DerivativeMarketMap.TAKE_BUY
    case DerivativeOrderSide.TakeSell:
      return DerivativeMarketMap.TAKE_SELL
    default:
      return DerivativeMarketMap.BUY
  }
}
