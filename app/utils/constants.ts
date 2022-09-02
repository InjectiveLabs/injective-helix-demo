import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getEndpointsForNetwork, Network } from '@injectivelabs/networks'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'

const getChainId = (): ChainId => {
  const envChainId = process.env.APP_CHAIN_ID

  if (envChainId) {
    return envChainId as ChainId
  }

  if (IS_TESTNET) {
    return ChainId.Testnet
  }

  if (IS_DEVNET) {
    return ChainId.Devnet
  }

  return ChainId.Mainnet
}

const getEthereumChainId = (): EthereumChainId => {
  const envEthereumChainId = process.env.APP_ETHEREUM_CHAIN_ID

  if (envEthereumChainId) {
    return parseInt(process.env.APP_ETHEREUM_CHAIN_ID.toString())
  }

  if (IS_TESTNET || IS_DEVNET) {
    return EthereumChainId.Goerli
  }

  return EthereumChainId.Mainnet
}

export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'
export const IS_MAINNET_STAGING: boolean = process.env.APP_ENV === 'staging'
export const METRICS_ENABLED: boolean = process.env.METRICS_ENABLED === 'true'
export const REFERRALS_ENABLED: boolean =
  process.env.REFERRALS_ENABLED === 'true'
export const PRICE_BAND_ENABLED: boolean =
  process.env.PRICE_BAND_ENABLED !== 'false' // Enabled by default
export const GAS_FREE_DEPOSIT_REBATE_ENABLED: boolean =
  process.env.GAS_FREE_DEPOSIT_REBATE_ENABLED === 'true'

export const GEO_IP_RESTRICTIONS_ENABLED: boolean =
  process.env.GEO_IP_RESTRICTIONS_ENABLED === 'true'
export const SHOW_AUCTION_COUNTDOWN: boolean =
  process.env.SHOW_AUCTION_COUNTDOWN === 'true'
export const ORDERBOOK_POLLING_ENABLED: boolean =
  process.env.ORDERBOOK_POLLING_ENABLED === 'true'
export const ORDERBOOK_STREAMING_ENABLED: boolean = !ORDERBOOK_POLLING_ENABLED

export const BASE_URL: string = process.env.APP_BASE_URL
export const FEE_RECIPIENT: string = process.env.APP_FEE_RECIPIENT
export const APP_EXCHANGE_API_ENDPOINT: string =
  process.env.APP_EXCHANGE_API_ENDPOINT || ''
export const APP_SENTRY_GRPC_ENDPOINT: string =
  process.env.APP_SENTRY_GRPC_ENDPOINT || ''
export const APP_SENTRY_HTTP_ENDPOINT: string =
  process.env.APP_SENTRY_HTTP_ENDPOINT || ''
export const APP_CHRONOS_API_ENDPOINT: string =
  process.env.APP_CHRONOS_API_ENDPOINT || ''
export const APP_NEWSLETTER_API: string = process.env.APP_NEWSLETTER_API || ''

export const UI_DEFAULT_MIN_DISPLAY_DECIMALS = 2
export const UI_DEFAULT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_MAX_DISPLAY_DECIMALS = 6
export const UI_DEFAULT_PRICE_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AGGREGATION_DECIMALS = 3
export const UI_DEFAULT_AGGREGATION_DECIMALS_STRING = '3'
export const UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS = 4
export const UI_DEFAULT_DMM_DECIMALS = 2
export const UI_DEFAULT_TOKEN_ASSET_DECIMALS = 8
export const UI_DEFAULT_MAX_NUMBER_OF_ORDERS = 20
export const UI_MINIMAL_AMOUNT = new BigNumber(1).shiftedBy(
  -UI_DEFAULT_MIN_DISPLAY_DECIMALS
)

export const NETWORK: Network = process.env.APP_NETWORK || Network.Testnet
export const IS_STAGING = process.env.APP_ENV === 'staging'
export const IS_DEVNET = [
  Network.Devnet,
  Network.Devnet1,
  Network.Local
].includes(NETWORK)
export const IS_TESTNET = [Network.Testnet, Network.TestnetK8s].includes(
  NETWORK
)
export const IS_MAINNET =
  NETWORK === Network.Mainnet || process.env.APP_ENV === 'mainnet'

export const CHAIN_ID: ChainId = getChainId()
export const ETHEREUM_CHAIN_ID: EthereumChainId = getEthereumChainId()

export const AMPLITUDE_KEY = process.env.APP_AMPLITUDE_KEY || ''
export const HAS_AMPLITUDE_KEY = !!AMPLITUDE_KEY

export const BIG_NUMBER_ROUND_HALF_UP_MODE = BigNumber.ROUND_HALF_UP

// 6 gwei for Kovan, fetched from gasStation for Mainnet
export const DEFAULT_PRICE_WARNING_DEVIATION = new BigNumber(5) // 5%
export const BIGGER_PRICE_WARNING_DEVIATION = new BigNumber(30) // 30%
export const DEFAULT_MARKET_PRICE_WARNING_DEVIATION = new BigNumber(10) // 10%
export const DEFAULT_MAX_SLIPPAGE = new BigNumber(0.5) // +0.5% slippage
export const DEFAULT_MAX_SLIPPAGE_FOR_CLOSING_POSITIONS = new BigNumber(100) // +100% slippage
export const DEFAULT_MIN_PRICE_BAND_DIFFERENCE = new BigNumber(80) // -80%
export const DEFAULT_MAX_PRICE_BAND_DIFFERENCE = new BigNumber(400) // +400%
export const DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS = 25

export const MAX_DISPLAYABLE_NUMBER = new BigNumberInBase(1_000_000_000)

export const MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE = 500
export const MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE = 1638313200 // 01 Dec 2020 00:00
export const DMM_TIME_STAMP_FORMAT: string = "MMM-dd-yyyy HH:mm:ss 'UTC'xxx"

export const VPN_PROXY_VALIDATION_PERIOD = 2 /* 2 days */

export const MIN_INJ_REQUIRED_FOR_GAS = 0.01

// to be added to ui-common
export const BAYC_WETH_PERP_SLUG = 'bayc-weth-perp'
export const ETH_COIN_GECKO_ID = 'ethereum'
export const USDT_COIN_GECKO_ID = 'tether'
export const UST_COIN_GECKO_ID = 'terrausd'
export const BTC_COIN_GECKO_ID = 'bitcoin'
export const INJ_TO_IBC_TRANSFER_FEE = 0.002
export const HIDDEN_BALANCE_DISPLAY = '********'

const endpoints = getEndpointsForNetwork(NETWORK)
const endpointsNotProvided =
  !endpoints &&
  (!APP_EXCHANGE_API_ENDPOINT ||
    !APP_SENTRY_GRPC_ENDPOINT ||
    !APP_SENTRY_HTTP_ENDPOINT)

if (endpointsNotProvided) {
  throw new Error(
    'You either have to provide a correct APP_NETWORK in the .env or provide APP_EXCHANGE_API_ENDPOINT, APP_SENTRY_GRPC_ENDPOINT and APP_SENTRY_HTTP_ENDPOINT'
  )
}

export const ENDPOINTS = {
  ...endpoints,
  chronosApi: APP_CHRONOS_API_ENDPOINT || undefined,
  exchangeApiEndpoint: APP_EXCHANGE_API_ENDPOINT || endpoints.exchangeApi,
  sentryGrpcApiEndpoint: APP_SENTRY_GRPC_ENDPOINT || endpoints.sentryGrpcApi,
  sentryHttpApi: APP_SENTRY_HTTP_ENDPOINT || endpoints.sentryHttpApi
}

export const COIN_GECKO_OPTIONS = {
  apiKey: process.env.APP_COINGECKO_KEY as string,
  baseUrl: process.env.APP_COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

export const ONE_IN_BASE = new BigNumberInBase(1)
export const USDT_DECIMALS = 6
export const UI_DEFAULT_PAGINATION_LIMIT_COUNT = 20

export const MARKETS_HISTORY_CHART_SEVEN_DAYS = 154
export const MARKETS_HISTORY_CHART_ONE_HOUR = 60
