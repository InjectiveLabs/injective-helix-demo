import {
  Network,
  isDevnet,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'

export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'

export const env = {
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_NAME: import.meta.env.VITE_NAME,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  // endpoints
  VITE_INDEXER_API_ENDPOINT: import.meta.env
    .VITE_INDEXER_API_ENDPOINT as string,
  VITE_CHRONOS_API_ENDPOINT: import.meta.env
    .VITE_CHRONOS_API_ENDPOINT as string,
  VITE_SENTRY_GRPC_ENDPOINT: import.meta.env
    .VITE_SENTRY_GRPC_ENDPOINT as string,
  VITE_SENTRY_REST_ENDPOINT: import.meta.env
    .VITE_SENTRY_REST_ENDPOINT as string,
  VITE_CACHE_REST_API_ENDPOINT: import.meta.env
    .VITE_CACHE_REST_API_ENDPOINT as string,
  VITE_NINJA_PASS_ENDPOINT: import.meta.env.VITE_NINJA_PASS_ENDPOINT as string
}

export const NETWORK: Network =
  (import.meta.env.VITE_NETWORK as Network) || Network.Devnet
export const IS_DEVNET: Boolean = isDevnet(NETWORK)
export const IS_TESTNET: Boolean = isTestnet(NETWORK)
export const IS_STAGING = import.meta.env.VITE_ENV === 'staging'
export const IS_MAINNET =
  isMainnet(NETWORK) || import.meta.env.VITE_ENV === 'mainnet'

export const CHAIN_ID: ChainId = (
  import.meta.env.VITE_CHAIN_ID
    ? import.meta.env.VITE_CHAIN_ID
    : IS_TESTNET
    ? ChainId.Testnet
    : IS_DEVNET
    ? ChainId.Devnet
    : ChainId.Mainnet
) as ChainId

export const ETHEREUM_CHAIN_ID: EthereumChainId = import.meta.env
  .VITE_ETHEREUM_CHAIN_ID
  ? parseInt(import.meta.env.VITE_ETHEREUM_CHAIN_ID.toString())
  : parseInt(
      (IS_TESTNET || IS_DEVNET
        ? EthereumChainId.Sepolia
        : EthereumChainId.Mainnet
      ).toString()
    )

const endpoints = getNetworkEndpoints(NETWORK)

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
    : env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer

export const ENDPOINTS = {
  ...endpoints,
  grpc: env.VITE_SENTRY_GRPC_ENDPOINT || endpoints.grpc,
  rest: env.VITE_SENTRY_REST_ENDPOINT || endpoints.rest,
  indexer: env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer,
  chronos: env.VITE_CHRONOS_API_ENDPOINT || endpoints.chronos,
  explorer: env.VITE_CHRONOS_API_ENDPOINT || endpoints.explorer,
  campaign: CAMPAIGN_ENDPOINT
}

export const BASE_URL = env.VITE_BASE_URL || ''

// override env with values
export const NINJA_PASS_ENDPOINT: string =
  env.VITE_NINJA_PASS_ENDPOINT || 'https://api.ninjapass.injective.dev'

export const SHOW_REDEEM_VOUCHER =
  import.meta.env.VITE_SHOW_REDEEM_VOUCHER === 'true'
export const BANNER_NOTICE_ENABLED =
  import.meta.env.VITE_BANNER_NOTICE_ENABLED === 'true'

export const SWAP_CONTRACT_ADDRESS = IS_DEVNET
  ? 'inj1qk00h5atutpsv900x202pxx42npjr9thrzhgxn'
  : IS_TESTNET
  ? 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43'
  : IS_STAGING
  ? 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'
  : 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'

export const HOTJAR_KEY = import.meta.env.VITE_HOTJAR_KEY || ''
export const BUGSNAG_KEY = import.meta.env.VITE_BUGSNAG_KEY || ''
export const MERCURYO_KEY = import.meta.env.VITE_MERCURYO_KEY || ''
export const MIXPANEL_KEY = import.meta.env.VITE_MIXPANEL_KEY || ''
export const FEE_RECIPIENT = import.meta.env.VITE_FEE_RECIPIENT || ''
export const NEWSLETTER_API = import.meta.env.VITE_NEWSLETTER_API || ''
export const MERCURYO_WIDGET_ID = import.meta.env.VITE_MERCURYO_WIDGET_ID || ''
export const SHEETDB_BEARER_TOKEN = import.meta.env.VITE_SHEETDB_BEARER
