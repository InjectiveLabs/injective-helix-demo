import { TokenMeta } from '@injectivelabs/spot-consumer'
import {
  peggyDenomToTokenFromContractAddress,
  peggyDenomToContractAddress
} from './peggy'
import {
  AllChronosSpotMarketSummary,
  ChronosSpotMarketSummary,
  BaseUiSpotMarket,
  UiSpotMarket,
  SpotOrderType,
  SpotMarketMap,
  Token
} from '~/types'

export const spotMarketToUiSpotMarket = (
  market: BaseUiSpotMarket,
  marketsSummary: AllChronosSpotMarketSummary | ChronosSpotMarketSummary
): UiSpotMarket => {
  return {
    ...market,
    ...marketsSummary,
    slug: market.ticker.replace('/', '-').replace(' ', '-').toLowerCase(),
    baseToken:
      market.baseToken !== undefined
        ? tokenMetaToToken(market.baseToken, market.baseDenom)
        : peggyDenomToTokenFromContractAddress(market.baseDenom),
    quoteToken:
      market.quoteToken !== undefined
        ? tokenMetaToToken(market.quoteToken, market.quoteDenom)
        : peggyDenomToTokenFromContractAddress(market.quoteDenom)
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
  orderType: SpotOrderType
): SpotMarketMap => {
  switch (orderType) {
    case SpotOrderType.Unspecified:
      return SpotMarketMap.UNSPECIFIED
    case SpotOrderType.Buy:
      return SpotMarketMap.BUY
    case SpotOrderType.Sell:
      return SpotMarketMap.SELL
    case SpotOrderType.StopBuy:
      return SpotMarketMap.STOP_BUY
    case SpotOrderType.TakeBuy:
      return SpotMarketMap.TAKE_BUY
    case SpotOrderType.TakeSell:
      return SpotMarketMap.TAKE_SELL
    default:
      return SpotMarketMap.BUY
  }
}
