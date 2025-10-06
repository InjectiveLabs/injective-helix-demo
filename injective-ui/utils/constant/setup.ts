import { ChainId, EvmChainId } from '@injectivelabs/ts-types'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints,
  getCw20AdapterContractForNetwork
} from '@injectivelabs/networks'

export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'

export const env = {
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_NAME: import.meta.env.VITE_NAME,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,

  // endpoints
  VITE_INDEXER_API_ENDPOINT: import.meta.env
    .VITE_INDEXER_API_ENDPOINT as string,
  VITE_UI_API_ENDPOINT: import.meta.env.VITE_UI_API_ENDPOINT as string,
  VITE_CHRONOS_API_ENDPOINT: import.meta.env
    .VITE_CHRONOS_API_ENDPOINT as string,
  VITE_SENTRY_GRPC_ENDPOINT: import.meta.env
    .VITE_SENTRY_GRPC_ENDPOINT as string,
  VITE_SENTRY_HTTP_ENDPOINT: import.meta.env
    .VITE_SENTRY_HTTP_ENDPOINT as string,
  VITE_CACHE_REST_API_ENDPOINT: import.meta.env
    .VITE_CACHE_REST_API_ENDPOINT as string
}

export const IS_MAINNET_STAGING: boolean = env.VITE_ENV === 'staging'
export const IS_PREVIEW = import.meta.env.VITE_PREVIEW === 'true'

export const NETWORK: Network =
  (import.meta.env.VITE_NETWORK as Network) || Network.Devnet
export const IS_DEVNET = isDevnet(NETWORK)
export const IS_TESTNET = isTestnet(NETWORK)
export const IS_MAINNET = !IS_DEVNET && !IS_TESTNET

export const CHAIN_ID: ChainId = (
  import.meta.env.VITE_CHAIN_ID
    ? import.meta.env.VITE_CHAIN_ID
    : IS_TESTNET
      ? ChainId.Testnet
      : IS_DEVNET
        ? ChainId.Devnet
        : ChainId.Mainnet
) as ChainId

export const ETHEREUM_CHAIN_ID: EvmChainId = import.meta.env
  .VITE_ETHEREUM_CHAIN_ID
  ? parseInt(import.meta.env.VITE_ETHEREUM_CHAIN_ID as string) as EvmChainId
  : IS_TESTNET || IS_DEVNET
    ? EvmChainId.Sepolia
    : EvmChainId.Mainnet

const endpoints = getNetworkEndpoints(NETWORK)
const endpointsNotProvided =
  !endpoints &&
  (!env.VITE_INDEXER_API_ENDPOINT ||
    !env.VITE_SENTRY_GRPC_ENDPOINT ||
    !env.VITE_SENTRY_HTTP_ENDPOINT)

if (endpointsNotProvided) {
  throw new Error(
    'You either have to provide a correct VITE_NETWORK in the .env or provide VITE_EXCHANGE_API_ENDPOINT, VITE_SENTRY_GRPC_ENDPOINT and VITE_SENTRY_HTTP_ENDPOINT'
  )
}

export const ENDPOINTS = {
  ...endpoints,
  grpc: env.VITE_SENTRY_GRPC_ENDPOINT || endpoints.grpc,
  http: env.VITE_SENTRY_HTTP_ENDPOINT || endpoints.rest,
  indexer: env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer,
  chronos: env.VITE_CHRONOS_API_ENDPOINT || endpoints.chronos,
  explorer: env.VITE_CHRONOS_API_ENDPOINT || endpoints.explorer,
  uiApi: env.VITE_UI_API_ENDPOINT || 'https://api.ui.injective.network/api/v1',
  cacheRest: env.VITE_CACHE_REST_API_ENDPOINT || endpoints.cacheRest
}

const MITO_DEVNET_API_ENDPOINT = 'https://devnet.api.ninja.injective.dev'
const MITO_TESTNET_API_ENDPOINT =
  'https://k8s.testnet.mito.grpc-web.injective.network'
const MITO_MAINNET_API_ENDPOINT =
  'https://k8s.mainnet.mito.grpc-web.injective.network'

export const MITO_API_ENDPOINTS: Record<Network, string> = {
  [Network.Local]: MITO_DEVNET_API_ENDPOINT,
  [Network.Devnet]: MITO_DEVNET_API_ENDPOINT,
  [Network.Testnet]: MITO_TESTNET_API_ENDPOINT,
  [Network.Mainnet]: MITO_MAINNET_API_ENDPOINT,
  [Network.Internal]: MITO_MAINNET_API_ENDPOINT,
  [Network.MainnetLB]: MITO_MAINNET_API_ENDPOINT,
  [Network.TestnetOld]: MITO_TESTNET_API_ENDPOINT,
  [Network.TestnetK8s]: MITO_TESTNET_API_ENDPOINT,
  [Network.MainnetK8s]: MITO_MAINNET_API_ENDPOINT,
  [Network.MainnetOld]: MITO_MAINNET_API_ENDPOINT,
  [Network.TestnetSentry]: MITO_TESTNET_API_ENDPOINT,
  [Network.MainnetSentry]: MITO_MAINNET_API_ENDPOINT,
  [Network.Devnet1]: 'https://devnet-1.api.ninja.injective.dev',
  [Network.Devnet2]: 'https://devnet-2.api.ninja.injective.dev',
  [Network.Devnet3]: 'https://devnet-3.api.ninja.injective.dev',
  [Network.Staging]: 'https://staging.api.mito.injective.network'
}

export const MITO_API_ENDPOINT =
  (import.meta.env.VITE_MITO_API_ENDPOINT as string) ||
  MITO_API_ENDPOINTS[NETWORK] ||
  MITO_DEVNET_API_ENDPOINT

// wallet
export const ALCHEMY_KEY = (import.meta.env.VITE_ALCHEMY_KEY || '') as string
export const COINGECKO_KEY = (import.meta.env.VITE_COINGECKO_KEY ||
  '') as string
export const ALCHEMY_SEPOLIA_KEY = (import.meta.env.VITE_ALCHEMY_SEPOLIA_KEY ||
  '') as string
export const SOL_ALCHEMY_KEY = (import.meta.env.VITE_SOL_ALCHEMY_KEY ||
  '') as string
export const BUGSNAG_KEY = (import.meta.env.VITE_BUGSNAG_KEY || '') as string
export const FEE_PAYER_PUB_KEY = (import.meta.env.VITE_FEE_PAYER_PUB_KEY ||
  '') as string

// plugins/tracking.ts
export const GOOGLE_ANALYTICS_KEY = import.meta.env
  .VITE_GOOGLE_ANALYTICS_KEY as string
export const PROXY_DETECTION_API_KEY =
  import.meta.env.VITE_PROXY_DETECTION_API_KEY || ''
export const HOTJAR_KEY = import.meta.env.VITE_HOTJAR_KEY as string
export const MIXPANEL_KEY = import.meta.env.VITE_MIXPANEL_KEY || ''
export const MAGIC_APK_KEY = import.meta.env.VITE_MAGIC_APK_KEY || ''
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

export const VPN_CHECKS_ENABLED: boolean =
  import.meta.env.VITE_VPN_CHECKS_ENABLED === 'true'
export const MAINTENANCE_DISABLED =
  import.meta.env.VITE_MAINTENANCE_DISABLED === 'true'
export const GEO_IP_RESTRICTIONS_ENABLED: boolean =
  import.meta.env.VITE_GEO_IP_RESTRICTIONS_ENABLED === 'true'

export const CW20_ADAPTER_CONTRACT = getCw20AdapterContractForNetwork(NETWORK)
export const APP_NAME = env.VITE_NAME as string
export const APP_BASE_URL = env.VITE_BASE_URL as string
export const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string

if (VPN_CHECKS_ENABLED && !GOOGLE_MAPS_KEY) {
  throw new Error('GOOGLE_MAPS_KEY is required when VPN_CHECKS_ENABLED')
}

if (VPN_CHECKS_ENABLED && !PROXY_DETECTION_API_KEY) {
  throw new Error('PROXY_DETECTION_API_KEY is required when VPN_CHECKS_ENABLED')
}

export const TURNKEY_ORGID = import.meta.env.VITE_TURNKEY_ORGID
export const TURNKEY_GOOGLE_CLIENT_ID = import.meta.env
  .VITE_TURNKEY_GOOGLE_CLIENT_ID

export const IS_HUB = import.meta.env.VITE_PRODUCT === 'hub'
export const IS_MITO = import.meta.env.VITE_PRODUCT === 'mito'
export const IS_AUTHZ = import.meta.env.VITE_PRODUCT === 'authz'
export const IS_HELIX = import.meta.env.VITE_PRODUCT === 'helix'
export const IS_BRIDGE = import.meta.env.VITE_PRODUCT === 'bridge'
export const IS_ADMIN_UI = import.meta.env.VITE_PRODUCT === 'admin'
export const IS_EXPLORER = import.meta.env.VITE_PRODUCT === 'explorer'
export const IS_TRADING_UI = import.meta.env.VITE_PRODUCT === 'trading'
