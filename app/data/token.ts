import {
  getCw20FromSymbolOrNameAsString,
  getPeggyDenomFromSymbolOrNameAsString
} from '@/app/utils/helper'

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

export const usdcTokenDenom = {
  [USDCSymbol.PeggyEthereum]: getPeggyDenomFromSymbolOrNameAsString(
    USDCSymbol.PeggyEthereum
  ),
  [USDCSymbol.WormholeEthereum]: getCw20FromSymbolOrNameAsString(
    USDCSymbol.WormholeEthereum
  ),
  [USDCSymbol.WormholeSolana]: getCw20FromSymbolOrNameAsString(
    USDCSymbol.WormholeSolana
  )
}

export const usdcTokenDenoms = Object.values(usdcTokenDenom)

export const stableCoinDenoms = [
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

export const legacyWHDenoms = [
  getCw20FromSymbolOrNameAsString('SOLlegacy'),
  getCw20FromSymbolOrNameAsString('ARBlegacy'),
  getCw20FromSymbolOrNameAsString('WMATIClegacy')
]
