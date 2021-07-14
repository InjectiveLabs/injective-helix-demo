import {
  Network,
  getUrlEndpointForNetwork,
  UrlEndpoint
} from '@injectivelabs/networks'
import { Wallet } from '@injectivelabs/web3-strategy'
import { NETWORK } from '../utils/constants'
import { localStorage } from './Storage'

class App {
  network: Network

  constructor() {
    this.network = NETWORK || Network.Local
  }

  get appUrlEndpoint(): UrlEndpoint {
    return getUrlEndpointForNetwork(this.network)
  }

  get wallet(): Wallet {
    const existingState = localStorage.get('state') as any

    return (
      (existingState.staking && existingState.staking.wallet) || Wallet.Metamask
    )
  }
}

export const app = new App()
