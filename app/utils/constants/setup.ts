import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import { GeneralException } from '@injectivelabs/exceptions'
import { getRoutes } from './routes'

const isWebpack = process.env.BUILDER_TYPE === 'webpack'

export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'

const env = {
  VITE_ENV: isWebpack ? process.env.VITE_ENV : import.meta.env.VITE_ENV,
  VITE_BASE_URL: isWebpack
    ? process.env.VITE_BASE_URL
    : import.meta.env.VITE_BASE_URL,
  VITE_NETWORK: isWebpack
    ? process.env.VITE_NETWORK
    : import.meta.env.VITE_NETWORK,
  VITE_CHAIN_ID: isWebpack
    ? process.env.VITE_CHAIN_ID
    : import.meta.env.VITE_CHAIN_ID,
  VITE_FEE_PAYER_PUB_KEY: isWebpack
    ? process.env.VITE_FEE_PAYER_PUB_KEY
    : import.meta.env.VITE_FEE_PAYER_PUB_KEY,

  /** Debugging */
  VITE_DEBUG_CALCULATION: isWebpack
    ? process.env.VITE_DEBUG_CALCULATION
    : import.meta.env.VITE_DEBUG_CALCULATION,

  VITE_MAINTENANCE_ENABLED: (isWebpack
    ? process.env.VITE_MAINTENANCE_ENABLED
    : import.meta.env.VITE_MAINTENANCE_ENABLED) as string | undefined,
  VITE_GEO_IP_RESTRICTIONS_ENABLED: isWebpack
    ? process.env.VITE_GEO_IP_RESTRICTIONS_ENABLED
    : import.meta.env.VITE_GEO_IP_RESTRICTIONS_ENABLED,
  VITE_PROXY_DETECTION_API_KEY: isWebpack
    ? process.env.VITE_PROXY_DETECTION_API_KEY
    : import.meta.env.VITE_PROXY_DETECTION_API_KEY,
  VITE_GOOGLE_MAPS_KEY: isWebpack
    ? process.env.VITE_GOOGLE_MAPS_KEY
    : import.meta.env.VITE_GOOGLE_MAPS_KEY,
  VITE_BANNER_NOTICE_ENABLED: (isWebpack
    ? process.env.VITE_BANNER_NOTICE_ENABLED
    : import.meta.env.VITE_BANNER_NOTICE_ENABLED) as string | undefined,

  VITE_ETHEREUM_CHAIN_ID: isWebpack
    ? process.env.VITE_ETHEREUM_CHAIN_ID
    : import.meta.env.VITE_ETHEREUM_CHAIN_ID,
  VITE_INDEXER_API_ENDPOINT: isWebpack
    ? process.env.VITE_INDEXER_API_ENDPOINT
    : import.meta.env.VITE_INDEXER_API_ENDPOINT,
  VITE_CHRONOS_API_ENDPOINT: isWebpack
    ? process.env.VITE_CHRONOS_API_ENDPOINT
    : import.meta.env.VITE_CHRONOS_API_ENDPOINT,
  VITE_EXPLORER_API_ENDPOINT: isWebpack
    ? process.env.VITE_EXPLORER_API_ENDPOINT
    : import.meta.env.VITE_EXPLORER_API_ENDPOINT,
  VITE_SENTRY_GRPC_ENDPOINT: isWebpack
    ? process.env.VITE_SENTRY_GRPC_ENDPOINT
    : import.meta.env.VITE_SENTRY_GRPC_ENDPOINT,
  VITE_SENTRY_HTTP_ENDPOINT: isWebpack
    ? process.env.VITE_SENTRY_HTTP_ENDPOINT
    : import.meta.env.VITE_SENTRY_HTTP_ENDPOINT,
  VITE_SENTRY_REST_ENDPOINT: isWebpack
    ? process.env.VITE_SENTRY_REST_ENDPOINT
    : import.meta.env.VITE_SENTRY_REST_ENDPOINT,

  VITE_NINJA_PASS_ENDPOINT: isWebpack
    ? process.env.VITE_NINJA_PASS_ENDPOINT
    : (import.meta.env.VITE_NINJA_PASS_ENDPOINT as string),

  VITE_COINGECKO_KEY: isWebpack
    ? process.env.VITE_COINGECKO_KEY
    : (import.meta.env.VITE_COINGECKO_KEY as string),
  VITE_AMPLITUDE_KEY: isWebpack
    ? process.env.VITE_AMPLITUDE_KEY
    : (import.meta.env.VITE_AMPLITUDE_KEY as string),
  VITE_GOOGLE_ANALYTICS_KEY: isWebpack
    ? process.env.VITE_GOOGLE_ANALYTICS_KEY
    : (import.meta.env.VITE_GOOGLE_ANALYTICS_KEY as string),
  VITE_HOTJAR_KEY: isWebpack
    ? process.env.VITE_HOTJAR_KEY
    : (import.meta.env.VITE_HOTJAR_KEY as string),
  VITE_BUGSNAG_KEY: (isWebpack
    ? process.env.VITE_BUGSNAG_KEY
    : import.meta.env.VITE_BUGSNAG_KEY) as string | undefined,

  VITE_NEWSLETTER_API: isWebpack
    ? process.env.VITE_NEWSLETTER_API
    : import.meta.env.VITE_NEWSLETTER_API,
  VITE_ALCHEMY_GOERLI_KEY: isWebpack
    ? process.env.VITE_ALCHEMY_GOERLI_KEY
    : import.meta.env.VITE_ALCHEMY_GOERLI_KEY,
  VITE_ALCHEMY_KEY: isWebpack
    ? process.env.VITE_ALCHEMY_KEY
    : import.meta.env.VITE_ALCHEMY_KEY,
  VITE_FEE_RECIPIENT: isWebpack
    ? (process.env.VITE_FEE_RECIPIENT as string)
    : (import.meta.env.VITE_FEE_RECIPIENT as string)
} as {
  VITE_ENV: string
  VITE_BASE_URL: string
  VITE_NETWORK: Network
  VITE_CHAIN_ID: ChainId
  VITE_FEE_PAYER_PUB_KEY: string
  VITE_DEBUG_CALCULATION: string
  VITE_GEO_IP_RESTRICTIONS_ENABLED: string
  VITE_PROXY_DETECTION_API_KEY: string
  VITE_GOOGLE_MAPS_KEY: string
  VITE_MAINTENANCE_ENABLED: string
  VITE_BANNER_NOTICE_ENABLED: string
  VITE_ETHEREUM_CHAIN_ID: string
  VITE_INDEXER_API_ENDPOINT: string
  VITE_CHRONOS_API_ENDPOINT: string
  VITE_EXPLORER_API_ENDPOINT: string
  VITE_SENTRY_GRPC_ENDPOINT: string
  VITE_SENTRY_HTTP_ENDPOINT: string
  VITE_SENTRY_REST_ENDPOINT: string
  VITE_NINJA_PASS_ENDPOINT: string
  VITE_COINGECKO_KEY: string
  VITE_AMPLITUDE_KEY: string
  VITE_GOOGLE_ANALYTICS_KEY: string
  VITE_HOTJAR_KEY: string
  VITE_NEWSLETTER_API: string
  VITE_ALCHEMY_GOERLI_KEY: string
  VITE_BUGSNAG_KEY: string
  VITE_ALCHEMY_KEY: string
  VITE_FEE_RECIPIENT: string
}

export const NETWORK: Network = (env.VITE_NETWORK as Network) || Network.Testnet
export const IS_DEVNET: Boolean = isDevnet(NETWORK)
export const IS_TESTNET: Boolean = isTestnet(NETWORK)
export const IS_STAGING = env.VITE_ENV === 'staging'
export const IS_MAINNET =
  [
    Network.Public,
    Network.Staging,
    Network.Mainnet,
    Network.MainnetK8s,
    Network.MainnetLB
  ].includes(NETWORK) || env.VITE_ENV === 'mainnet'

export const CHAIN_ID: ChainId = (
  env.VITE_CHAIN_ID
    ? env.VITE_CHAIN_ID
    : IS_TESTNET
    ? ChainId.Testnet
    : IS_DEVNET
    ? ChainId.Devnet
    : ChainId.Mainnet
) as ChainId

export const ETHEREUM_CHAIN_ID: EthereumChainId = env.VITE_ETHEREUM_CHAIN_ID
  ? parseInt(env.VITE_ETHEREUM_CHAIN_ID.toString())
  : parseInt(
      (IS_TESTNET || IS_DEVNET
        ? EthereumChainId.Goerli
        : EthereumChainId.Mainnet
      ).toString()
    )

const endpoints = getNetworkEndpoints(NETWORK)

const restEndpointsNotProvided =
  !env.VITE_SENTRY_REST_ENDPOINT && !env.VITE_SENTRY_HTTP_ENDPOINT
const endpointsNotProvided =
  !endpoints &&
  (!env.VITE_INDEXER_API_ENDPOINT ||
    !env.VITE_SENTRY_GRPC_ENDPOINT ||
    !restEndpointsNotProvided)

if (endpointsNotProvided) {
  throw new GeneralException(
    new Error(
      'You either have to provide a correct VITE_NETWORK in the .env or provide VITE_EXCHANGE_API_ENDPOINT, VITE_SENTRY_GRPC_ENDPOINT and VITE_SENTRY_REST_ENDPOINT'
    )
  )
}

export const ENDPOINTS = {
  ...endpoints,
  grpc: env.VITE_SENTRY_GRPC_ENDPOINT || endpoints.grpc,
  rest:
    env.VITE_SENTRY_REST_ENDPOINT ||
    env.VITE_SENTRY_HTTP_ENDPOINT ||
    endpoints.rest,
  indexer: env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer,
  chronos: env.VITE_CHRONOS_API_ENDPOINT || endpoints.chronos,
  explorer: env.VITE_CHRONOS_API_ENDPOINT || endpoints.explorer
}

export const BASE_URL = env.VITE_BASE_URL || ''

// override env with values
export const VITE_NINJA_PASS_ENDPOINT: string =
  env.VITE_NINJA_PASS_ENDPOINT || 'https://api.ninjapass.injective.dev'
export const FEE_PAYER_PUB_KEY = (env.VITE_FEE_PAYER_PUB_KEY || '') as string

export const VITE_BANNER_NOTICE_ENABLED =
  env.VITE_BANNER_NOTICE_ENABLED === 'true'

export const VITE_NEWSLETTER_API = env.VITE_NEWSLETTER_API || ''
export const ALCHEMY_GOERLI_KEY = env.VITE_ALCHEMY_GOERLI_KEY || ''
export const ALCHEMY_KEY = env.VITE_ALCHEMY_KEY || ''
export const AMPLITUDE_KEY = env.VITE_AMPLITUDE_KEY || ''
export const VITE_GOOGLE_ANALYTICS_KEY = env.VITE_GOOGLE_ANALYTICS_KEY || ''
export const VITE_HOTJAR_KEY = env.VITE_HOTJAR_KEY || ''
export const FEE_RECIPIENT = env.VITE_FEE_RECIPIENT || ''
export const BUGSNAG_KEY = env.VITE_BUGSNAG_KEY || ''

export const COIN_GECKO_OPTIONS = {
  apiKey: env.VITE_COINGECKO_KEY as string,
  baseUrl: env.VITE_COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

export const GEO_IP_RESTRICTIONS_ENABLED: boolean =
  env.VITE_GEO_IP_RESTRICTIONS_ENABLED === 'true'
export const VITE_PROXY_DETECTION_API_KEY =
  env.VITE_PROXY_DETECTION_API_KEY || ''

export const VITE_GOOGLE_MAPS_KEY = env.VITE_GOOGLE_MAPS_KEY || ''
export const PROXY_DETECTION_ENABLED = !!VITE_PROXY_DETECTION_API_KEY
export const DEBUG_CALCULATION: boolean = env.VITE_DEBUG_CALCULATION === 'true'
export const MAINTENANCE_ENABLED = env.VITE_MAINTENANCE_ENABLED === 'true'

const { ROUTES, MARKETS_SLUGS } = getRoutes(NETWORK, env.VITE_ENV as string)

export { ROUTES, MARKETS_SLUGS }
