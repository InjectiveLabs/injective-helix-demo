import { INJ_DENOM } from '@injectivelabs/utils'
import { Network } from '@shared/types'
import { TokenStatic } from '@injectivelabs/token-metadata'
import {
  getCw20FromSymbolOrNameAsString,
  getIbcDenomFromSymbolOrNameAsString,
  getPeggyDenomFromSymbolOrNameAsString
} from '@/app/utils/helper'
import { USDCSymbol } from '@/types'

interface NetworkToSymbolMap {
  [key: string]: string
}

export const networkToSymbolMap = {
  [Network.Ethereum]: 'ETH',
  [Network.Axelar]: 'AXL',
  [Network.CosmosHub]: 'ATOM',
  [Network.Crescent]: 'CRE',
  [Network.Evmos]: 'EVMOS',
  // [Network.Moonbeam]: 'AXL',
  [Network.Osmosis]: 'OSMO',
  [Network.Persistence]: 'XPRT',
  [Network.Secret]: 'SCRT',
  [Network.Stride]: 'STRD',
  [Network.Arbitrum]: 'ARB'
} as NetworkToSymbolMap

export const TokenSymbols = {
  WETH: 'wETH',
  USDT: 'USDT',
  INJ: 'INJ'
}

export const tokenToDecimalsOverrideMap = {
  [TokenSymbols.WETH]: 5
}

export const getDenomsFromToken = (token: TokenStatic): string[] => {
  const cw20Denom = getCw20FromSymbolOrNameAsString(token.symbol)
  const ibcDenom = getIbcDenomFromSymbolOrNameAsString(token.symbol)
  const peggyDenom = getPeggyDenomFromSymbolOrNameAsString(token.symbol)

  const denoms = [cw20Denom, ibcDenom, peggyDenom, token.denom].filter(
    (denom) => denom
  )

  return [...new Set(denoms)]
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

export const usdcTokenDenoms = [
  usdcTokenDenom.USDC,
  usdcTokenDenom.USDCet
  // usdcTokenDenom.USDCso
]

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

export const tokensDenomToPreloadHomepageSwap = [
  INJ_DENOM,
  // getIbcDenomFromSymbolOrNameAsString('SOL', TokenSource.Solana),
  getIbcDenomFromSymbolOrNameAsString('ATOM'),
  getPeggyDenomFromSymbolOrNameAsString('WETH'),
  // getIbcDenomFromSymbolOrNameAsString('PYTH', TokenSource.Solana),
  // getIbcDenomFromSymbolOrNameAsString('WMATIC', TokenSource.Polygon),
  getIbcDenomFromSymbolOrNameAsString('KAVA')
]
