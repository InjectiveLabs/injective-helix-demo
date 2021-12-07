import {
  Network,
  getUrlEndpointForNetwork,
  UrlEndpoint
} from '@injectivelabs/networks'
import { Wallet } from '@injectivelabs/web3-strategy'
import {
  APP_EXCHANGE_API_ENDPOINT,
  APP_SENTRY_GRPC_ENDPOINT,
  NETWORK
} from '../utils/constants'
import { localStorage } from './Storage'
import { GeoLocation } from '~/types'

class App {
  network: Network

  geoLocation?: GeoLocation

  constructor() {
    this.network = NETWORK || Network.Local
  }

  get appUrlEndpoint(): UrlEndpoint {
    const endpoints = getUrlEndpointForNetwork(this.network)
    const baseExplorerApiEndpoint =
      APP_EXCHANGE_API_ENDPOINT || endpoints.exchangeUrl
    const sentryGrpcApiEndpoint = APP_SENTRY_GRPC_ENDPOINT || endpoints.chainUrl

    return {
      ...endpoints,
      exchangeUrl: baseExplorerApiEndpoint,
      baseUrl: `${baseExplorerApiEndpoint}/api`,
      explorerUrl: `${baseExplorerApiEndpoint}/api/explorer/v1`,
      chainUrl: sentryGrpcApiEndpoint
    }
  }

  setGeoLocation(geoLocation: GeoLocation) {
    this.geoLocation = geoLocation
  }

  get regionForMetrics(): string {
    const { geoLocation } = this

    if (geoLocation && geoLocation.country) {
      return geoLocation.country
    }

    return 'none'
  }

  get wallet(): Wallet {
    const existingState = localStorage.get('state') as any

    return (
      (existingState.staking && existingState.staking.wallet) || Wallet.Metamask
    )
  }
}

export const app = new App()
