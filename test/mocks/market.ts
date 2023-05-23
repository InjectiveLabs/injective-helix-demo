import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import {
  UiSpotMarketWithToken,
  MarketType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { TokenType } from '@injectivelabs/token-metadata'
import { injTokenMeta, usdtTokenMeta } from './token'

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

export const injUsdtSpotMarketWithToken: UiSpotMarketWithToken = {
  marketId:
    '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe',
  marketStatus: 'active',
  ticker: 'INJ/USDT',
  baseDenom: 'inj',
  quoteDenom: 'peggy0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5',
  quoteToken: usdtTokenMeta,
  baseToken: injTokenMeta,
  makerFeeRate: '-0.0001',
  takerFeeRate: '0.001',
  serviceProviderFee: '0.4',
  minPriceTickSize: 1e-15,
  minQuantityTickSize: 1000000000000000,
  slug: 'inj-usdt',
  type: MarketType.Spot,
  subType: MarketType.Spot,
  priceDecimals: 3,
  quantityDecimals: 3,
  priceTensMultiplier: -3,
  quantityTensMultiplier: -3
}

export const injUsdtDerivativeMarketWithToken: UiDerivativeMarketWithToken = {
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
  quoteToken: {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    logo: 'usdt.svg',
    coinGeckoId: 'tether',
    erc20: {
      decimals: 6,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT'
    },
    tokenType: TokenType.Erc20,
    denom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
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
  baseToken: {
    name: 'Injective',
    symbol: 'INJ',
    decimals: 18,
    logo: 'injective-v3.svg',
    coinGeckoId: 'injective-protocol',
    erc20: {
      decimals: 18,
      address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30',
      symbol: 'INJ'
    },
    tokenType: TokenType.Native,
    denom: 'inj'
  },
  type: MarketType.Derivative,
  subType: MarketType.Perpetual,
  quantityDecimals: 3,
  priceDecimals: 3,
  quantityTensMultiplier: -3,
  priceTensMultiplier: -3
}
