import { peggyDenomToTokenFromContractAddress } from './peggy'
import {
  AllChronosSpotMarketSummary,
  ChronosSpotMarketSummary,
  BaseUiSpotMarket,
  UiSpotMarket,
  SpotOrderType,
  SpotMarketMap
} from '~/types'

export const spotMarketToUiSpotMarket = (
  market: BaseUiSpotMarket,
  marketsSummary: AllChronosSpotMarketSummary | ChronosSpotMarketSummary
): UiSpotMarket => {
  return {
    ...market,
    ...marketsSummary,
    baseToken: peggyDenomToTokenFromContractAddress(market.baseDenom),
    quoteToken: peggyDenomToTokenFromContractAddress(market.quoteDenom)
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
