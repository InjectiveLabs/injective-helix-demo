import { INJ_COIN_GECKO_ID, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { getContractAddressesForNetworkOrThrow } from '@injectivelabs/contracts'
import { Token, TokenType } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/utils'
import { CW20_ADAPTER_CONTRACT_BY_NETWORK } from '@injectivelabs/sdk-ts'
import { NETWORK } from '@/app/utils/constants'
import { denomClient } from '@/app/Services'
import { USDCSymbol } from '@/types'

const adapterContract = CW20_ADAPTER_CONTRACT_BY_NETWORK[NETWORK]

export const injToken = {
  usdPrice: 0,
  decimals: 18,
  symbol: 'INJ',
  name: 'Injective',
  denom: INJ_DENOM,
  tokenType: TokenType.Native,
  coinGeckoId: INJ_COIN_GECKO_ID,
  logo: '/bridgingNetworks/injective.png',
  icon: '/bridgingNetworks/injective.png',
  erc20Address: getContractAddressesForNetworkOrThrow(NETWORK).injective
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
  [BridgingNetwork.Stride]: 'STRD'
} as NetworkToSymbolMap

export const getFactoryDenomFromSymbol = (symbol: USDCSymbol) => {
  const tokenMeta = denomClient.getTokenMetaDataBySymbol(symbol)

  if (!tokenMeta || !adapterContract) {
    return ''
  }

  return `factory/${adapterContract}/${tokenMeta.cw20Address}`
}

export const getPeggyDenomFromSymbol = (symbol: USDCSymbol) => {
  const tokenMeta = denomClient.getTokenMetaDataBySymbol(symbol)

  if (!tokenMeta || !tokenMeta.erc20Address) {
    return ''
  }

  return `peggy${tokenMeta.erc20Address.toLowerCase()}`
}

export const usdcTokenDenom = {
  [USDCSymbol.PeggyEthereum]: getPeggyDenomFromSymbol(USDCSymbol.PeggyEthereum),
  [USDCSymbol.WormholeEthereum]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeEthereum
  ),
  [USDCSymbol.WormholeSolana]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeSolana
  )
}

export const usdcTokenDenoms = [
  usdcTokenDenom.USDC,
  usdcTokenDenom.USDCet
  // usdcTokenDenom.USDCso
]

export const stableCoinDenoms = ['USDT', 'USDC', 'USDCet', 'USDCso']
