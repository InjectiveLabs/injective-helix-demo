import { TokenMeta } from '@injectivelabs/derivatives-consumer'
import {
  peggyDenomToTokenFromContractAddress,
  peggyDenomToContractAddress
} from './peggy'
import { tokensMetaData } from '~/app/tokens/meta'
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
  return {
    ...market,
    ...marketsSummary,
    slug: market.ticker.replace('/', '-').replace(' ', '-').toLowerCase(),
    baseToken: tokensMetaData.get('inj')! as Token,
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
  orderType: DerivativeOrderType
): DerivativeMarketMap => {
  switch (orderType) {
    case DerivativeOrderType.Unspecified:
      return DerivativeMarketMap.UNSPECIFIED
    case DerivativeOrderType.Long:
      return DerivativeMarketMap.LONG
    case DerivativeOrderType.Short:
      return DerivativeMarketMap.SHORT
    case DerivativeOrderType.StopLong:
      return DerivativeMarketMap.STOP_LONG
    case DerivativeOrderType.TakeLong:
      return DerivativeMarketMap.TAKE_LONG
    case DerivativeOrderType.TakeShort:
      return DerivativeMarketMap.TAKE_SHORT
    default:
      return DerivativeMarketMap.LONG
  }
}
