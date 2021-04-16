import {
  Network,
  Region,
  getRpcFromRegion,
  getUrlEndpointFromRegion,
  getWsRpcFromRegion,
  Rpc,
  UrlEndpoint
} from '@injectivelabs/networks'
import { ChainId } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/web3-strategy'
import { CHAIN_ID, NETWORK } from '../utils/constants'
import { localStorage } from './Storage'

class App {
  region: Region
  network: Network
  chainId: ChainId

  constructor() {
    this.region = Region.eu
    this.chainId = CHAIN_ID || ChainId.Testnet
    this.network = NETWORK || Network.Local
  }

  get appRpcUrl(): Rpc {
    return getRpcFromRegion(this.region, this.network)
  }

  get wsRpcUrl(): Rpc {
    return getWsRpcFromRegion(this.region, this.network)
  }

  get appUrlEndpoint(): UrlEndpoint {
    return getUrlEndpointFromRegion(this.region, this.network)
  }

  get wallet(): Wallet {
    const existingState = localStorage.get('state') as any

    return (
      (existingState.staking && existingState.staking.wallet) || Wallet.Metamask
    )
  }
}

export const app = new App()
