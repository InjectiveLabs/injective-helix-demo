import type { BigNumberInBase } from '@injectivelabs/utils'
import type {
  SpotMarket,
  TokenStatic,
  PerpetualMarket,
  ExpiryFuturesMarket,
  BinaryOptionsMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import type { SharedMarketType, SharedMarketChange } from './enum'

export type SharedUiMarketMarkPrice = {
  price: string
  marketId: string
  timestamp?: number
}

export interface SharedUiMarketSummary
  extends AllChronosDerivativeMarketSummary {
  lastPrice?: number
  lastPriceChange?: SharedMarketChange
}

export interface SharedUiMarketHistory {
  time: number[]
  marketId: string
  volume: number[]
  resolution: string
  lowPrice: number[]
  highPrice: number[]
  openPrice: number[]
  closePrice: number[]
}

export interface SharedUiBinaryOptionsMarket
  extends Omit<BinaryOptionsMarket, 'quoteToken'> {
  slug: string
  upcoming?: boolean
  priceDecimals: number
  baseToken: TokenStatic
  type: SharedMarketType
  quoteToken: TokenStatic
  quantityDecimals: number
  subType: SharedMarketType
  minNotionalInToken: string
  priceTensMultiplier: number
  quantityTensMultiplier: number
}

export interface SharedUiSpotMarket
  extends Omit<SpotMarket, 'baseToken' | 'quoteToken'> {
  slug: string
  upcoming?: boolean
  isVerified: boolean
  priceDecimals: number
  baseToken: TokenStatic
  type: SharedMarketType
  quoteToken: TokenStatic
  quantityDecimals: number
  subType: SharedMarketType
  minNotionalInToken: string
  priceTensMultiplier: number
  quantityTensMultiplier: number
}

export interface SharedUiExpiryFuturesMarket
  extends Omit<ExpiryFuturesMarket, 'quoteToken'> {
  slug: string
  upcoming?: boolean
  priceDecimals: number
  baseToken: TokenStatic
  type: SharedMarketType
  quoteToken: TokenStatic
  quantityDecimals: number
  subType: SharedMarketType
  minNotionalInToken: string
  priceTensMultiplier: number
  quantityTensMultiplier: number
  estFundingRate: BigNumberInBase
}

export interface SharedUiDerivativeMarket
  extends Omit<PerpetualMarket, 'quoteToken'> {
  // estFundingRate: BigNumberInBase
  slug: string
  upcoming?: boolean
  isVerified: boolean
  priceDecimals: number
  baseToken: TokenStatic
  type: SharedMarketType
  quoteToken: TokenStatic
  quantityDecimals: number
  subType: SharedMarketType
  minNotionalInToken: string
  priceTensMultiplier: number
  quantityTensMultiplier: number
  expiryFuturesMarketInfo?: {
    expirationTimestamp: number
    settlementPrice: string
  }
}
