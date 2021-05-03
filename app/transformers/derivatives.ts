import { TokenMeta } from '@injectivelabs/derivatives-consumer'
import { BigNumberInWei } from '@injectivelabs/utils'
import { getDecimalsFromNumber } from '../utils/helpers'
import {
  peggyDenomToTokenFromContractAddress,
  peggyDenomToContractAddress
} from './peggy'
import {
  AllChronosDerivativeMarketSummary,
  ChronosDerivativeMarketSummary,
  BaseUiDerivativeMarket,
  UiDerivativeMarket,
  DerivativeOrderType,
  DerivativeMarketMap,
  Token
} from '~/types'

export const derivativeMarketToUiDerivativeMarket = (
  market: BaseUiDerivativeMarket,
  marketsSummary:
    | AllChronosDerivativeMarketSummary
    | ChronosDerivativeMarketSummary
): UiDerivativeMarket => {
  const slug = market.ticker.replace('/', '-').replace(' ', '-').toLowerCase()
  const [baseTokenSymbol] = slug.split('-')
  const quoteToken =
    market.quoteToken !== undefined
      ? tokenMetaToToken(market.quoteToken, market.quoteDenom)
      : peggyDenomToTokenFromContractAddress(market.quoteDenom)

  return {
    ...market,
    ...marketsSummary,
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
