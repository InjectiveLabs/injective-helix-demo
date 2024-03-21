import { INJ_DENOM } from '@injectivelabs/utils'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import type { Token, TokenWithPrice } from '@injectivelabs/token-metadata'
import { tokenMetaUtils } from '@/app/Services'
import {
  getCw20FromSymbolOrNameAsString,
  getIbcDenomFromSymbolOrNameAsString,
  getPeggyDenomFromSymbolOrNameAsString
} from '@/app/utils/helper'
import { USDCSymbol } from '@/types'

export const injToken = {
  denom: INJ_DENOM,
  ...tokenMetaUtils.getMetaBySymbol('INJ'),
  usdPrice: 0
} as TokenWithPrice

export const usdtToken = {
  ...(tokenMetaUtils.getMetaBySymbol('USDT') || {}),
  denom: `peggy${tokenMetaUtils.getMetaBySymbol('USDT')?.erc20?.address}` || ''
} as Token

interface NetworkToSymbolMap {
  [key: string]: string
}

export const networkToSymbolMap = {
  [BridgingNetwork.Ethereum]: 'ETH',
  [BridgingNetwork.Axelar]: 'AXL',
  [BridgingNetwork.CosmosHub]: 'ATOM',
  [BridgingNetwork.Crescent]: 'CRE',
  [BridgingNetwork.Evmos]: 'EVMOS',
  [BridgingNetwork.Moonbeam]: 'AXL',
  [BridgingNetwork.Osmosis]: 'OSMO',
  [BridgingNetwork.Persistence]: 'XPRT',
  [BridgingNetwork.Secret]: 'SCRT',
  [BridgingNetwork.Stride]: 'STRD',
  [BridgingNetwork.Arbitrum]: 'ARB'
} as NetworkToSymbolMap

export const TokenSymbols = {
  WETH: 'wETH',
  USDT: 'USDT',
  INJ: 'INJ'
}

export const tokenToDecimalsOverrideMap = {
  [TokenSymbols.WETH]: 5
}

export const getDenomsFromToken = (token: Token): string[] => {
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
  getCw20FromSymbolOrNameAsString('SOL'),
  getCw20FromSymbolOrNameAsString('ARB'),
  getCw20FromSymbolOrNameAsString('WMATIC')
]
