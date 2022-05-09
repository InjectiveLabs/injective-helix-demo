import {
  Network,
  getUrlEndpointForNetwork,
  UrlEndpoints
} from '@injectivelabs/networks'
import { Wallet } from '@injectivelabs/web3-strategy'
import {
  APP_EXCHANGE_API_ENDPOINT,
  APP_SENTRY_GRPC_ENDPOINT,
  APP_SENTRY_HTTP_ENDPOINT,
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

  get endpoints(): UrlEndpoints {
    const endpoints = getUrlEndpointForNetwork(this.network)
    const exchangeApiEndpoint =
      APP_EXCHANGE_API_ENDPOINT || endpoints.exchangeApi
    const sentryGrpcApiEndpoint =
      APP_SENTRY_GRPC_ENDPOINT || endpoints.sentryGrpcApi
    const sentryHttpApiEndpoint =
      APP_SENTRY_HTTP_ENDPOINT || endpoints.sentryHttpApi

    return {
      ...endpoints,
      exchangeApi: exchangeApiEndpoint,
      sentryGrpcApi: sentryGrpcApiEndpoint,
      sentryHttpApi: sentryHttpApiEndpoint
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
