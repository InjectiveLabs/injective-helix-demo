import { peggyDenomToTokenFromContractAddress } from './peggy'
import {
  AllChronosSpotMarketSummary,
  ChronosSpotMarketSummary,
  BaseUiSpotMarket,
  UiSpotMarket
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
