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
