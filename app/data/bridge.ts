import { BridgingNetwork, NetworkMeta } from '@injectivelabs/sdk-ui-ts'
import { TransferSide } from '~/types'

export const networksMeta = [
  {
    text: 'Injective',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png',
    symbol: 'injective-v3.svg'
  },
  {
    text: 'Ethereum',
    value: BridgingNetwork.Ethereum,
    icon: '/bridgingNetworks/ethereum.png',
    symbol: 'ethereum.svg'
  },
  {
    text: 'CosmosHub',
    value: BridgingNetwork.CosmosHub,
    icon: '/bridgingNetworks/cosmosHub.png',
    symbol: 'atom.svg'
  },
  {
    text: 'Terra',
    value: BridgingNetwork.Terra,
    icon: '/bridgingNetworks/terra.png',
    symbol: 'luna.png'
  },
  {
    text: 'Osmosis',
    value: BridgingNetwork.Osmosis,
    icon: '/bridgingNetworks/osmosis.png',
    symbol: 'osmo.png'
  },
  {
    text: 'Chihuahua',
    value: BridgingNetwork.Chihuahua,
    icon: '/bridgingNetworks/chihuahua.jpeg',
    symbol: 'chihuahua.jpeg'
  },
  {
    text: 'Evmos',
    value: BridgingNetwork.Evmos,
    icon: '/bridgingNetworks/evmos.png',
    symbol: 'evmos.svg'
  },
  {
    text: 'Persistence',
    value: BridgingNetwork.Persistence,
    icon: '/bridgingNetworks/persistence.png',
    symbol: 'xprt.svg'
  },
  /*
  {
    text: 'Juno',
    value: BridgingNetwork.Juno,
    icon: '/bridgingNetworks/juno.jpeg',
  },
  */
  {
    text: 'Axelar',
    value: BridgingNetwork.Axelar,
    icon: '/bridgingNetworks/axelar.jpeg',
    symbol: 'axelar.jpeg'
  },
  {
    text: 'Moonbeam',
    value: BridgingNetwork.Moonbeam,
    icon: '/bridgingNetworks/moonbeam.png',
    symbol: 'injective.png'
  }
] as NetworkMeta[]

export const transferSideMeta = {
  [TransferSide.Bank]: {
    text: 'Injective Wallet',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png'
  },

  [TransferSide.TradingAccount]: {
    text: 'Trading Account',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png'
  }
}

export const getBridgingNetworkBySymbol = (symbol: string): BridgingNetwork => {
  const symbolToUpperCase = symbol.toUpperCase()

  if (['ATOM', 'UPHOTON'].includes(symbolToUpperCase)) {
    return BridgingNetwork.CosmosHub
  }

  if (['LUNA', 'ULUNA', 'UST', 'UUSD'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Terra
  }

  if (['OSMO', 'UOSMO'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Osmosis
  }

  if (['HUAHUA', 'UHUAHUA'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Chihuahua
  }

  if (['JUNO', 'UJUNO'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Juno
  }

  if (['EVMOS'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Evmos
  }

  if (['XRPT'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Persistence
  }

  if (['AXL', 'UAXL', 'DOT', 'DOT-PLANCK'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Axelar
  }

  if (['DOT'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Moonbeam
  }

  return BridgingNetwork.Ethereum
}
