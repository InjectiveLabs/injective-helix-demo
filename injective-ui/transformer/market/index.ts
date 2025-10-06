import { injToken } from '../../data/token'
import { derivativeMarketIdMap } from '../../data/derivative'
import { spotDenomMap, spotMarketIdMap } from '../../data/spot'
import {
  sharedToBalanceInWei,
  sharedToBalanceInToken,
  sharedGetTensMultiplier,
  sharedGetExactDecimalsFromNumber
} from '../../utils/formatter'
import {
  TokenType,
  type SpotMarket,
  type TokenStatic,
  type PerpetualMarket,
  type BinaryOptionsMarket,
  type ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import {
  SharedMarketType,
  type SharedUiSpotMarket,
  type SharedUiDerivativeMarket,
  type SharedUiBinaryOptionsMarket
} from '../../types'
export * from './summary'
export * from './history'

export const sharedGetDerivativeSlugOverride = ({
  ticker,
  marketId
}: {
  ticker: string
  marketId: string
}): string => {
  if (derivativeMarketIdMap[marketId]) {
    return derivativeMarketIdMap[marketId].slug
  }

  return ticker.replaceAll('/', '-').replaceAll(' ', '-').toLowerCase()
}

export const sharedSpotGetSlugAndTicket = ({
  marketId,
  slug,
  ticker,
  baseDenom,
  quoteDenom
}: {
  slug: string
  ticker: string
  marketId: string
  baseDenom: string
  quoteDenom: string
}): { slug: string; ticker: string } => {
  if (spotMarketIdMap[marketId]) {
    return spotMarketIdMap[marketId]
  }

  if (spotDenomMap[baseDenom]) {
    return spotDenomMap[baseDenom]({ slug, ticker })
  }

  if (spotDenomMap[quoteDenom]) {
    return spotDenomMap[quoteDenom]({ slug, ticker })
  }

  return { slug, ticker }
}

export const sharedDerivativeGetSlugAndTicket = ({
  marketId,
  slug,
  ticker
}: {
  slug: string
  ticker: string
  marketId: string
}): { slug: string; ticker: string } => {
  if (derivativeMarketIdMap[marketId]) {
    return derivativeMarketIdMap[marketId]
  }

  return { slug, ticker }
}

export const toUiSpotMarket = ({
  market,
  baseToken,
  quoteToken
}: {
  market: SpotMarket
  baseToken: TokenStatic
  quoteToken: TokenStatic
}): SharedUiSpotMarket => {
  const slug = market.ticker
    .trim()
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase()

  const minPriceTickSize = sharedToBalanceInWei({
    value: market.minPriceTickSize,
    decimalPlaces: baseToken.decimals - quoteToken.decimals
  }).toFixed()

  const minQuantityTickSize = sharedToBalanceInWei({
    value: market.minQuantityTickSize,
    decimalPlaces: -baseToken.decimals
  }).toFixed()

  return {
    ...market,
    ...sharedSpotGetSlugAndTicket({
      slug,
      ticker: market.ticker,
      marketId: market.marketId,
      baseDenom: market.baseDenom,
      quoteDenom: market.quoteDenom
    }),
    baseToken,
    quoteToken,
    isVerified: false,
    type: SharedMarketType.Spot,
    subType: SharedMarketType.Spot,
    priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
    priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
    quantityDecimals: sharedGetExactDecimalsFromNumber(minQuantityTickSize),
    quantityTensMultiplier: sharedGetTensMultiplier(minQuantityTickSize),
    minNotionalInToken: sharedToBalanceInToken({
      value: market.minNotional,
      decimalPlaces: quoteToken.decimals
    })
  }
}

export const toUiDerivativeMarket = ({
  slug,
  market,
  baseToken,
  quoteToken
}: {
  slug: string
  baseToken: TokenStatic
  quoteToken: TokenStatic
  market: PerpetualMarket | ExpiryFuturesMarket
}): SharedUiDerivativeMarket => {
  const minPriceTickSize = sharedToBalanceInWei({
    value: market.minPriceTickSize,
    decimalPlaces: -quoteToken.decimals
  }).toFixed()

  return {
    ...market,
    baseToken,
    quoteToken,
    isVerified: false,
    ...sharedDerivativeGetSlugAndTicket({
      slug,
      ticker: market.ticker,
      marketId: market.marketId
    }),
    type: SharedMarketType.Derivative,
    subType: (market as PerpetualMarket).isPerpetual
      ? SharedMarketType.Perpetual
      : SharedMarketType.Futures,
    priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
    priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
    quantityDecimals: sharedGetExactDecimalsFromNumber(
      market.minQuantityTickSize
    ),
    quantityTensMultiplier: sharedGetTensMultiplier(market.minQuantityTickSize),
    minNotionalInToken: sharedToBalanceInToken({
      value: market.minNotional,
      decimalPlaces: quoteToken.decimals
    })
  }
}

export const toUiBinaryOptionsMarket = ({
  market,
  quoteToken
}: {
  quoteToken: TokenStatic
  market: BinaryOptionsMarket
}): SharedUiBinaryOptionsMarket => {
  const slug = market.ticker
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase()

  const [baseTokenSymbol] = quoteToken
    ? market.ticker.replace(quoteToken.symbol, '')
    : market.ticker.replace('/', '')

  const baseToken = {
    ...injToken,
    denom: slug,
    symbol: baseTokenSymbol,
    name: baseTokenSymbol,
    decimals: 18,
    coinGeckoId: '',
    tokenType: TokenType.Native
  } as TokenStatic

  const minPriceTickSize = sharedToBalanceInWei({
    value: market.minPriceTickSize,
    decimalPlaces: baseToken.decimals - quoteToken.decimals
  }).toFixed()

  const minQuantityTickSize = sharedToBalanceInWei({
    value: market.minQuantityTickSize,
    decimalPlaces: -baseToken.decimals
  }).toFixed()

  return {
    ...market,
    slug,
    baseToken,
    quoteToken,
    type: SharedMarketType.BinaryOptions,
    subType: SharedMarketType.BinaryOptions,
    priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
    priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
    quantityDecimals: sharedGetExactDecimalsFromNumber(minQuantityTickSize),
    quantityTensMultiplier: sharedGetTensMultiplier(minQuantityTickSize),
    minNotionalInToken: sharedToBalanceInToken({
      value: market.minNotional,
      decimalPlaces: quoteToken.decimals
    })
  }
}
