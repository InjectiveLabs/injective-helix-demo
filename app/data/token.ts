import { INJ_COIN_GECKO_ID, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { getContractAddressesForNetworkOrThrow } from '@injectivelabs/contracts'
import { Token, TokenType } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/utils'
import { NETWORK } from '../utils/constants'

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
