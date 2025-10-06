import {
  env,
  IS_DEVNET,
  ENDPOINTS,
  IS_MAINNET,
  IS_TESTNET
} from '@shared/utils/constant'

export const IS_STAGING = import.meta.env.VITE_ENV === 'staging'
export const STAKING_CONTRACT_ADDRESS = IS_MAINNET
  ? 'inj1gtze7qm07nky47n7mwgj4zatf2s77xqvh3k2n8'
  : IS_TESTNET
    ? 'inj17yk350dhnct9pc4pvswn02243wg8h6x65pr5xt'
    : 'inj1guczj53xxl4347adagh23eelyhnxvugwwgqn0q'

const CAMPAIGN_ENDPOINT =
  IS_MAINNET && !IS_STAGING
    ? 'https://k8s.mainnet.campaigns.grpc-web.injective.network'
    : IS_TESTNET
      ? 'https://k8s.testnet.campaigns.grpc-web.injective.network'
      : env.VITE_INDEXER_API_ENDPOINT || ENDPOINTS.indexer
const NINJA_PASS_ENDPOINT: string =
  import.meta.env.VITE_NINJA_PASS_ENDPOINT ||
  'https://api.ninjapass.injective.dev'

// TODO: change to mainnet when ready
const ARCHIVER_ENDPOINT = IS_MAINNET
  ? 'https://k8s.mainnet.staging.archiver.grpc-web.injective.network'
  : IS_TESTNET
    ? 'https://k8s.testnet.staging.archiver.grpc-web.injective.network'
    : ENDPOINTS.indexer

export const HELIX_ENDPOINTS = {
  archiver: ARCHIVER_ENDPOINT,
  campaign: CAMPAIGN_ENDPOINT,
  ninjaPass: NINJA_PASS_ENDPOINT
}

export const SHOW_REDEEM_VOUCHER =
  import.meta.env.VITE_SHOW_REDEEM_VOUCHER === 'true'

export const SWAP_CONTRACT_ADDRESS = IS_DEVNET
  ? 'inj14hj2tavq8fpesdwxxcu44rty3hh90vhujaxlnz'
  : IS_TESTNET
    ? 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43'
    : IS_STAGING
      ? 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'
      : 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9'

export const FAUCET_ENDPOINT = IS_TESTNET
  ? import.meta.env.VITE_FAUCET_TESTNET_API
  : import.meta.env.VITE_FAUCET_MAINNET_API

export const ONRAMPER_SIGNING_KEY =
  import.meta.env.VITE_ONRAMPER_SIGNING_KEY || ''
export const IS_ONRAMPER_DEV_MODE =
  import.meta.env.VITE_IS_ONRAMPER_DEV_MODE === 'true'
export const ONRAMPER_API_KEY = IS_ONRAMPER_DEV_MODE
  ? import.meta.env.VITE_ONRAMPER_API_KEY_DEV
  : import.meta.env.VITE_ONRAMPER_API_KEY_PROD
export const BUGSNAG_KEY = import.meta.env.VITE_BUGSNAG_KEY || ''
export const MIXPANEL_KEY = import.meta.env.VITE_MIXPANEL_KEY || ''
export const FEE_RECIPIENT = import.meta.env.VITE_FEE_RECIPIENT || ''
export const NEWSLETTER_API = import.meta.env.VITE_NEWSLETTER_API || ''
export const SHEETDB_BEARER_TOKEN =
  import.meta.env.VITE_SHEETDB_BEARER_TOKEN || ''
