import { getNetworkEndpoints, Network } from '@injectivelabs/networks'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import { GeneralException } from '@injectivelabs/exceptions'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'

const env = {
  VITE_ENV: isWebpack ? process.env.VITE_ENV : import.meta.env.VITE_ENV,
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

  VITE_GEO_IP_RESTRICTIONS_ENABLED: isWebpack
    ? process.env.VITE_GEO_IP_RESTRICTIONS_ENABLED
    : import.meta.env.VITE_GEO_IP_RESTRICTIONS_ENABLED,
  VITE_REFERRALS_ENABLED: isWebpack
    ? process.env.VITE_REFERRALS_ENABLED
    : import.meta.env.VITE_REFERRALS_ENABLED,

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

  VITE_NINJA_PASS_API_ENDPOINT: isWebpack
    ? process.env.VITE_NINJA_PASS_API_ENDPOINT
    : (import.meta.env.VITE_NINJA_PASS_API_ENDPOINT as string),

  VITE_COINGECKO_KEY: isWebpack
    ? process.env.VITE_COINGECKO_KEY
    : (import.meta.env.VITE_COINGECKO_KEY as string),
  VITE_AMPLITUDE_KEY: isWebpack
    ? process.env.VITE_AMPLITUDE_KEY
    : (import.meta.env.VITE_AMPLITUDE_KEY as string)
}

export const NETWORK: Network = (env.VITE_NETWORK as Network) || Network.Testnet
export const IS_DEVNET: Boolean = [
  Network.Devnet,
  Network.Devnet1,
  Network.Local
].includes(NETWORK)
export const IS_TESTNET: Boolean = [
  Network.Testnet,
  Network.TestnetK8s
].includes(NETWORK)
export const IS_STAGING = env.VITE_ENV === 'staging'
export const IS_MAINNET =
  NETWORK === Network.Mainnet || env.VITE_ENV === 'mainnet'

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

const endpointsNotProvided =
  !endpoints &&
  (!env.VITE_INDEXER_API_ENDPOINT ||
    !env.VITE_SENTRY_GRPC_ENDPOINT ||
    !env.VITE_SENTRY_HTTP_ENDPOINT)

if (endpointsNotProvided) {
  throw new GeneralException(
    new Error(
      'You either have to provide a correct VITE_NETWORK in the .env or provide VITE_EXCHANGE_API_ENDPOINT, VITE_SENTRY_GRPC_ENDPOINT and VITE_SENTRY_HTTP_ENDPOINT'
    )
  )
}

export const ENDPOINTS = {
  ...endpoints,
  grpc: (env.VITE_SENTRY_GRPC_ENDPOINT as string) || endpoints.grpc,
  http: (env.VITE_SENTRY_HTTP_ENDPOINT as string) || endpoints.rest,
  indexer: (env.VITE_INDEXER_API_ENDPOINT as string) || endpoints.indexer,
  chronos: (env.VITE_CHRONOS_API_ENDPOINT as string) || endpoints.chronos,
  explorer: (env.VITE_CHRONOS_API_ENDPOINT as string) || endpoints.explorer
}

export const BASE_URL = isWebpack
  ? process.env.VITE_BASE_URL
  : import.meta.env.VITE_BASE_URL

// override env with values
export const VITE_NINJA_PASS_API_ENDPOINT: string =
  env.VITE_NINJA_PASS_API_ENDPOINT || 'https://api.ninjapass.injective.dev'
export const FEE_PAYER_PUB_KEY = (env.VITE_FEE_PAYER_PUB_KEY || '') as string

export const VITE_NEWSLETTER_API: string = isWebpack
  ? (process.env.VITE_NEWSLETTER_API as string)
  : (import.meta.env.VITE_NEWSLETTER_API as string)

export const ALCHEMY_GOERLI_KEY = isWebpack
  ? process.env.VITE_ALCHEMY_GOERLI_KEY
  : import.meta.env.VITE_ALCHEMY_GOERLI_KEY

export const ALCHEMY_KEY = isWebpack
  ? process.env.VITE_ALCHEMY_KEY
  : import.meta.env.VITE_ALCHEMY_KEY

export const AMPLITUDE_KEY = isWebpack
  ? process.env.VITE_AMPLITUDE_KEY
  : import.meta.env.VITE_AMPLITUDE_KEY

export const FEE_RECIPIENT: string = isWebpack
  ? (process.env.VITE_FEE_RECIPIENT as string)
  : (import.meta.env.VITE_FEE_RECIPIENT as string)

export const COIN_GECKO_OPTIONS = {
  apiKey: env.VITE_COINGECKO_KEY as string,
  baseUrl: env.VITE_COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

export const REFERRALS_ENABLED: boolean = env.VITE_REFERRALS_ENABLED === 'true'

export const GEO_IP_RESTRICTIONS_ENABLED: boolean =
  env.VITE_GEO_IP_RESTRICTIONS_ENABLED === 'true'

export const DEBUG_CALCULATION: boolean = env.VITE_DEBUG_CALCULATION === 'true'
