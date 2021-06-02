import { TokenMeta } from '@injectivelabs/spot-consumer'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { getDecimalsFromNumber } from '../utils/helpers'
import { peggyDenomToContractAddress } from './peggy'
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
  market: BaseUiSpotMarket, // Markets with base and quote token meta data
  marketsSummary: AllChronosSpotMarketSummary | ChronosSpotMarketSummary
): UiSpotMarket => {
  const quoteToken = tokenMetaToToken(market.quoteToken!, market.quoteDenom)
  const baseToken = tokenMetaToToken(market.baseToken!, market.baseDenom)

  return {
    ...market,
    ...marketsSummary,
    baseToken,
    quoteToken,
    slug: market.ticker.replace('/', '-').replace(' ', '-').toLowerCase(),
    priceDecimals: getDecimalsFromNumber(
      new BigNumberInBase(market.minPriceTickSize)
        .toWei(baseToken.decimals - quoteToken.decimals)
        .toNumber()
    ),
    quantityDecimals: getDecimalsFromNumber(
      new BigNumberInWei(market.minQuantityTickSize).toBase().toNumber()
    )
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
