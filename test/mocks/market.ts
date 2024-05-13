import { injToken, usdtToken } from '@shared/data/token'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { SharedMarketType } from '@shared/types'
import { UiSpotMarket, UiDerivativeMarket } from '@/types'

export const feeDiscountAccountInfo: FeeDiscountAccountInfo = {
  accountInfo: {
    makerDiscountRate: '0',
    stakedAmount: '0',
    takerDiscountRate: '0',
    volume: '0'
  },
  accountTtl: {
    tier: 0,
    ttlTimestamp: 60
  },
  tierLevel: 0
}

export const injUsdtSpotMarketWithToken: UiSpotMarket = {
  marketId:
    '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe',
  marketStatus: 'active',
  ticker: 'INJ/USDT',
  baseDenom: 'inj',
  quoteDenom: 'peggy0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5',
  quoteToken: usdtToken,
  baseToken: injToken,
  makerFeeRate: '-0.0001',
  takerFeeRate: '0.001',
  serviceProviderFee: '0.4',
  minPriceTickSize: 1e-15,
  minQuantityTickSize: 1000000000000000,
  slug: 'inj-usdt',
  type: SharedMarketType.Spot,
  subType: SharedMarketType.Spot,
  priceDecimals: 3,
  quantityDecimals: 3,
  priceTensMultiplier: -3,
  quantityTensMultiplier: -3,
  isVerified: true
}

export const injUsdtDerivativeMarketWithToken: UiDerivativeMarket = {
  oracleBase: 'INJ',
  oracleQuote: 'USDT',
  oracleType: 'bandibc',
  oracleScaleFactor: 6,
  initialMarginRatio: '0.195',
  maintenanceMarginRatio: '0.095',
  isPerpetual: true,
  marketId:
    '0x9b9980167ecc3645ff1a5517886652d94a0825e54a77d2057cbbe3ebee015963',
  marketStatus: 'active',
  ticker: 'INJ/USDT PERP',
  quoteDenom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
  quoteToken: usdtToken,
  makerFeeRate: '-0.0001',
  takerFeeRate: '0.001',
  serviceProviderFee: '0.4',
  minPriceTickSize: 1000,
  minQuantityTickSize: 0.001,
  perpetualMarketInfo: {
    hourlyFundingRateCap: '0.0000625',
    hourlyInterestRate: '0.00000416666',
    nextFundingTimestamp: 1682658000,
    fundingInterval: 3600
  },
  perpetualMarketFunding: {
    cumulativeFunding: '1327964.359537491329435011',
    cumulativePrice: '0.15682432006675919',
    lastTimestamp: 1682654542
  },
  slug: 'inj-usdt-perp',
  baseToken: injToken,
  type: SharedMarketType.Derivative,
  subType: SharedMarketType.Perpetual,
  quantityDecimals: 3,
  priceDecimals: 3,
  quantityTensMultiplier: -3,
  priceTensMultiplier: -3,
  isVerified: true
}
