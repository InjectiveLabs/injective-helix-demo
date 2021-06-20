import { TokenMeta } from '@injectivelabs/derivatives-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { peggyDenomToContractAddress } from './peggy'
import { getDecimalsFromNumber } from '~/app/utils/helpers'
import { sortPerpetualMarkets } from '~/components/partials/derivatives/sort'
import {
  BaseUiDerivativeMarket,
  UiDerivativeMarket,
  DerivativeOrderType,
  DerivativeMarketMap,
  Token
} from '~/types'

export const derivativeMarketToUiDerivativeMarket = (
  market: BaseUiDerivativeMarket
): UiDerivativeMarket => {
  const slug = market.ticker.replace('/', '-').replace(' ', '-').toLowerCase()
  const [baseTokenSymbol] = slug.split('-')
  const quoteToken = tokenMetaToToken(market.quoteToken!, market.quoteDenom)

  return {
    ...market,
    quoteToken,
    priceDecimals: getDecimalsFromNumber(
      new BigNumberInWei(market.minPriceTickSize)
        .toBase(quoteToken.decimals)
        .toNumber()
    ),
    quantityDecimals: getDecimalsFromNumber(market.minQuantityTickSize),
    baseTokenSymbol: (baseTokenSymbol || '').toUpperCase(),
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
  orderType: DerivativeOrderType
): DerivativeMarketMap => {
  switch (orderType) {
    case DerivativeOrderType.Unspecified:
      return DerivativeMarketMap.UNSPECIFIED
    case DerivativeOrderType.Buy:
      return DerivativeMarketMap.BUY
    case DerivativeOrderType.Sell:
      return DerivativeMarketMap.SELL
    case DerivativeOrderType.StopBuy:
      return DerivativeMarketMap.STOP_BUY
    case DerivativeOrderType.StopSell:
      return DerivativeMarketMap.STOP_SELL
    case DerivativeOrderType.TakeBuy:
      return DerivativeMarketMap.TAKE_BUY
    case DerivativeOrderType.TakeSell:
      return DerivativeMarketMap.TAKE_SELL
    default:
      return DerivativeMarketMap.BUY
  }
}
