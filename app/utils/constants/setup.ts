import {
  Network,
  isDevnet,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import { GeneralException } from '@injectivelabs/exceptions'

export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'

const env = {
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  VITE_NETWORK: import.meta.env.VITE_NETWORK,
  VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
  VITE_FEE_PAYER_PUB_KEY: import.meta.env.VITE_FEE_PAYER_PUB_KEY,

  /** Debugging */
  VITE_DEBUG_CALCULATION: import.meta.env.VITE_DEBUG_CALCULATION,

  VITE_MAINTENANCE_ENABLED: import.meta.env.VITE_MAINTENANCE_ENABLED as
    | string
    | undefined,
  VITE_BANNER_NOTICE_ENABLED: import.meta.env.VITE_BANNER_NOTICE_ENABLED as
    | string
    | undefined,

  VITE_ETHEREUM_CHAIN_ID: import.meta.env.VITE_ETHEREUM_CHAIN_ID,
  VITE_INDEXER_API_ENDPOINT: import.meta.env.VITE_INDEXER_API_ENDPOINT,
  VITE_CHRONOS_API_ENDPOINT: import.meta.env.VITE_CHRONOS_API_ENDPOINT,
  VITE_EXPLORER_API_ENDPOINT: import.meta.env.VITE_EXPLORER_API_ENDPOINT,
  VITE_SENTRY_GRPC_ENDPOINT: import.meta.env.VITE_SENTRY_GRPC_ENDPOINT,
  VITE_SENTRY_HTTP_ENDPOINT: import.meta.env.VITE_SENTRY_HTTP_ENDPOINT,
  VITE_SENTRY_REST_ENDPOINT: import.meta.env.VITE_SENTRY_REST_ENDPOINT,

  VITE_NINJA_PASS_ENDPOINT: import.meta.env.VITE_NINJA_PASS_ENDPOINT as string,

  VITE_COINGECKO_KEY: import.meta.env.VITE_COINGECKO_KEY as string,
  VITE_AMPLITUDE_KEY: import.meta.env.VITE_AMPLITUDE_KEY as string,
  VITE_MIXPANEL_KEY: import.meta.env.VITE_MIXPANEL_KEY as string,
  VITE_HOTJAR_KEY: import.meta.env.VITE_HOTJAR_KEY as string,
  VITE_GOOGLE_ANALYTICS_KEY: import.meta.env
    .VITE_GOOGLE_ANALYTICS_KEY as string,
  VITE_BUGSNAG_KEY: import.meta.env.VITE_BUGSNAG_KEY as string | undefined,
  VITE_ALCHEMY_KEY: import.meta.env.VITE_ALCHEMY_KEY,
  VITE_ALCHEMY_SEPOLIA_KEY: import.meta.env.VITE_ALCHEMY_SEPOLIA_KEY,
  VITE_SHEETDB_BEARER_TOKEN: import.meta.env.VITE_SHEETDB_BEARER_TOKEN as
    | string
    | undefined,

  VITE_NEWSLETTER_API: import.meta.env.VITE_NEWSLETTER_API,
  VITE_FEE_RECIPIENT: import.meta.env.VITE_FEE_RECIPIENT as string,
  VITE_SHOW_REDEEM_VOUCHER: import.meta.env.VITE_SHOW_REDEEM_VOUCHER as string
} as {
  VITE_ENV: string
  VITE_BASE_URL: string
  VITE_NETWORK: Network
  VITE_CHAIN_ID: ChainId
  VITE_FEE_PAYER_PUB_KEY: string
  VITE_DEBUG_CALCULATION: string
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
  VITE_MIXPANEL_KEY: string
  VITE_GOOGLE_ANALYTICS_KEY: string
  VITE_HOTJAR_KEY: string
  VITE_BUGSNAG_KEY: string
  VITE_ALCHEMY_KEY: string
  VITE_ALCHEMY_SEPOLIA_KEY: string
  VITE_SHEETDB_BEARER_TOKEN: string
  VITE_NEWSLETTER_API: string
  VITE_FEE_RECIPIENT: string
  VITE_SHOW_REDEEM_VOUCHER: string
}

export const NETWORK: Network = (env.VITE_NETWORK as Network) || Network.Testnet
export const IS_DEVNET: Boolean = isDevnet(NETWORK)
export const IS_TESTNET: Boolean = isTestnet(NETWORK)
export const IS_STAGING = env.VITE_ENV === 'staging'
export const IS_MAINNET = isMainnet(NETWORK) || env.VITE_ENV === 'mainnet'

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
        ? EthereumChainId.Sepolia
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

export const STAKING_CONTRACT_ADDRESS = IS_MAINNET
  ? 'inj1gtze7qm07nky47n7mwgj4zatf2s77xqvh3k2n8'
  : IS_TESTNET
  ? 'inj17yk350dhnct9pc4pvswn02243wg8h6x65pr5xt'
  : 'inj1qa4hswlcjmttulj0q9qa46jf64f93pecxar5pu'

const CAMPAIGN_ENDPOINT =
  IS_MAINNET && !IS_STAGING
    ? 'https://k8s.mainnet.campaigns.grpc-web.injective.network'
    : IS_TESTNET
    ? 'https://k8s.testnet.campaigns.grpc-web.injective.network'
    : endpoints.indexer

export const ENDPOINTS = {
  ...endpoints,
  grpc: env.VITE_SENTRY_GRPC_ENDPOINT || endpoints.grpc,
  rest:
    env.VITE_SENTRY_REST_ENDPOINT ||
    env.VITE_SENTRY_HTTP_ENDPOINT ||
    endpoints.rest,
  indexer: env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer,
  chronos: env.VITE_CHRONOS_API_ENDPOINT || endpoints.chronos,
  explorer: env.VITE_CHRONOS_API_ENDPOINT || endpoints.explorer,
  campaign: CAMPAIGN_ENDPOINT
}

export const BASE_URL = env.VITE_BASE_URL || ''

// override env with values
export const NINJA_PASS_ENDPOINT: string =
  env.VITE_NINJA_PASS_ENDPOINT || 'https://api.ninjapass.injective.dev'
export const FEE_PAYER_PUB_KEY = (env.VITE_FEE_PAYER_PUB_KEY || '') as string

export const BANNER_NOTICE_ENABLED = env.VITE_BANNER_NOTICE_ENABLED === 'true'

export const NEWSLETTER_API = env.VITE_NEWSLETTER_API || ''
export const ALCHEMY_SEPOLIA_KEY = env.VITE_ALCHEMY_SEPOLIA_KEY || ''
export const HOTJAR_KEY = env.VITE_HOTJAR_KEY || ''
export const ALCHEMY_KEY = env.VITE_ALCHEMY_KEY || ''
export const AMPLITUDE_KEY = env.VITE_AMPLITUDE_KEY || ''
export const MIXPANEL_KEY = env.VITE_MIXPANEL_KEY || ''
export const FEE_RECIPIENT = env.VITE_FEE_RECIPIENT || ''
export const BUGSNAG_KEY = env.VITE_BUGSNAG_KEY || ''
export const SHEETDB_BEARER_TOKEN = env.VITE_SHEETDB_BEARER_TOKEN || ''
export const SHOW_REDEEM_VOUCHER = env.VITE_SHOW_REDEEM_VOUCHER === 'true'

export const SWAP_CONTRACT_ADDRESS = IS_DEVNET
  ? 'inj1qk00h5atutpsv900x202pxx42npjr9thrzhgxn'
  : IS_TESTNET
  ? 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43'
  : IS_STAGING
  ? 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'
  : 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'

export const COIN_GECKO_OPTIONS = {
  apiKey: env.VITE_COINGECKO_KEY as string,
  baseUrl: env.VITE_COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

export const DEBUG_CALCULATION: boolean = env.VITE_DEBUG_CALCULATION === 'true'
export const MAINTENANCE_ENABLED = env.VITE_MAINTENANCE_ENABLED === 'true'
