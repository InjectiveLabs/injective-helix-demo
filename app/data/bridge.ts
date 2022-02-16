import { BridgingNetwork, NetworkMeta } from '@injectivelabs/ui-common'
import { TransferSide } from '~/types'

export const networksMeta = [
  {
    text: 'Injective Chain',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png'
  },
  {
    text: 'Ethereum',
    value: BridgingNetwork.Ethereum,
    icon: '/bridgingNetworks/ethereum.png'
  },
  {
    text: 'CosmosHub',
    value: BridgingNetwork.CosmosHub,
    icon: '/bridgingNetworks/cosmosHub.png'
  },
  {
    text: 'Terra',
    value: BridgingNetwork.Terra,
    icon: '/bridgingNetworks/terra.png'
  },
  {
    text: 'Osmosis',
    value: BridgingNetwork.Osmosis,
    icon: '/bridgingNetworks/osmosis.png'
  },
  {
    text: 'Chihuahua',
    value: BridgingNetwork.Chihuahua,
    icon: '/bridgingNetworks/chihuahua.jpeg'
  }
  /*
  {
    text: 'Juno',
    value: BridgingNetwork.Juno,
    icon: '/bridgingNetworks/juno.jpeg',
  },
  {
    text: 'Axelar',
    value: BridgingNetwork.Axelar,
    icon: '/bridgingNetworks/axelar.jpeg'
  } */
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
