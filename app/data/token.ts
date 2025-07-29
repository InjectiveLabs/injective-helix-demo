import { unknownToken } from '@shared/data/token'

export enum USDCSymbol {
  PeggyEthereum = 'USDC',
  WormholeEthereum = 'USDCet',
  WormholeSolana = 'USDCso'
}

export const TokenSymbols = {
  WETH: 'wETH',
  USDT: 'USDT',
  INJ: 'INJ'
}

export const tokenToDecimalsOverrideMap = {
  [TokenSymbols.WETH]: 5
}

export const stableCoinSymbols = [
  'USDT',
  'USDC',
  'USDCet',
  'USDCso',
  'USDCnb',
  'USDTkv'
]
export const KAVA_USDT_SYMBOL = 'USDTkv'
export const STINJ_USDT_SYMBOL = 'STINJ'
export const allowanceResetSymbols = ['USDT']
export const SWAP_LOW_LIQUIDITY_SYMBOLS = ['GF', 'ORAI', 'SOMM', 'NEOK']

// for testing only
export const hardCodedDevnetTokens = [
  {
    address: 'kava',
    isNative: false,
    tokenVerification: 'verified',
    decimals: 6,
    symbol: 'KAVA',
    name: 'KAVA',
    logo: unknownToken.logo,
    coinGeckoId: '',
    tokenType: 'symbol',
    denom: 'kava',
    externalLogo: 'unknown.png'
  },
  {
    address: 'uni',
    isNative: false,
    tokenVerification: 'verified',
    decimals: 6,
    symbol: 'UNI',
    name: 'UNI',
    logo: unknownToken.logo,
    coinGeckoId: '',
    tokenType: 'symbol',
    denom: 'uni',
    externalLogo: 'unknown.png'
  }
]
