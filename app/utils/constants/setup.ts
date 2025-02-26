import {
  env,
  IS_MAINNET,
  IS_TESTNET,
  IS_DEVNET,
  ENDPOINTS
} from '@shared/utils/constant'

export const IS_STAGING = import.meta.env.VITE_ENV === 'staging'
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
    : env.VITE_INDEXER_API_ENDPOINT || ENDPOINTS.indexer
const NINJA_PASS_ENDPOINT: string =
  import.meta.env.VITE_NINJA_PASS_ENDPOINT ||
  'https://api.ninjapass.injective.dev'

export const HELIX_ENDPOINTS = {
  campaign: CAMPAIGN_ENDPOINT,
  ninjaPass: NINJA_PASS_ENDPOINT
}

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

export const IS_ONRAMPER_DEV_MODE =
  import.meta.env.VITE_IS_ONRAMPER_DEV_MODE === 'true'
export const ONRAMPER_API_KEY = IS_ONRAMPER_DEV_MODE
  ? import.meta.env.VITE_ONRAMPER_API_KEY_DEV
  : import.meta.env.VITE_ONRAMPER_API_KEY_PROD
export const HOTJAR_KEY = import.meta.env.VITE_HOTJAR_KEY || ''
export const BUGSNAG_KEY = import.meta.env.VITE_BUGSNAG_KEY || ''
export const MIXPANEL_KEY = import.meta.env.VITE_MIXPANEL_KEY || ''
export const FEE_RECIPIENT = import.meta.env.VITE_FEE_RECIPIENT || ''
export const NEWSLETTER_API = import.meta.env.VITE_NEWSLETTER_API || ''
export const SHEETDB_BEARER_TOKEN = import.meta.env.VITE_SHEETDB_BEARER || ''
