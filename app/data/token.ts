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
  symbol: 'INJ',
  logo: '/bridgingNetworks/injective.png',
  icon: '/bridgingNetworks/injective.png',
  name: 'Injective',
  decimals: 18,
  coinGeckoId: INJ_COIN_GECKO_ID,
  address: getContractAddressesForNetworkOrThrow(NETWORK).injective,
  denom: INJ_DENOM,
  usdPrice: 0,
  tokenType: TokenType.Native
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

  return `factory/${adapterContract}/${tokenMeta.address}`
}

export const getPeggyDenomFromSymbol = (symbol: USDCSymbol) => {
  const tokenMeta = denomClient.getTokenMetaDataBySymbol(symbol)

  if (!tokenMeta || !tokenMeta.address) {
    return ''
  }

  return `peggy${tokenMeta.address.toLowerCase()}`
}

export const usdcTokenDenom = {
  [USDCSymbol.PeggyEthereum]: getPeggyDenomFromSymbol(USDCSymbol.PeggyEthereum),
  [USDCSymbol.WormholeEthereum]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeEthereum
  ),
  [USDCSymbol.WormholeSolana]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeSolana
  )
