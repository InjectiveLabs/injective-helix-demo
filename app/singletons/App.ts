import {
  Network,
  getUrlEndpointForNetwork,
  UrlEndpoint
} from '@injectivelabs/networks'
import { ChainId } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/web3-strategy'
import { CHAIN_ID, NETWORK } from '../utils/constants'
import { localStorage } from './Storage'

class App {
  network: Network
  chainId: ChainId

  constructor() {
    this.chainId = CHAIN_ID || ChainId.Injective
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
