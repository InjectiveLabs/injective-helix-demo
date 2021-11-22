import { Network } from '@injectivelabs/networks'
import { NETWORK } from './constants'

export const getHubUrl = (): string => {
  if (NETWORK === Network.Devnet) {
    return 'https://devnet.dex.injective.dev'
  }

  if (NETWORK === Network.Testnet) {
    return 'https://testnet.dex.injective.dev'
  }

  return 'https://hub.injective.network'
}
