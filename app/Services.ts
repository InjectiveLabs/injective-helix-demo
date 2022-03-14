import { getUrlEndpointForNetwork } from '@injectivelabs/networks'
import {
  BridgeService,
  BankService,
  TokenService,
  TokenErc20Service,
  TokenCoinGeckoService,
  GasService,
  BankActionService,
  TokenErc20ServiceAction,
  PeggyActionService,
  SpotService,
  DerivativeActionService,
  SpotActionService,
  SubaccountActionService,
  BridgeTransformer,
  ServiceOptions
} from '@injectivelabs/ui-common'
import { AlchemyApi } from '@injectivelabs/alchemy-api'
import { CoinGeckoApi } from '@injectivelabs/token-utils'
import {
  CHAIN_ID,
  IS_TESTNET,
  NETWORK,
  METRICS_ENABLED,
  APP_EXCHANGE_API_ENDPOINT,
  APP_SENTRY_GRPC_ENDPOINT
} from './utils/constants'
import { SubaccountService } from './services/account'
import { ExchangeService } from './services/exchange'
import { AuctionService } from './services/auction'
import { DerivativeService } from './services/derivatives'
import { ExplorerService } from './services/explorer'
import { ReferralService } from './services/referral'
import { web3Strategy } from './web3'
import { app } from '~/app/singletons/App'

const alchemyRpcEndpoint = IS_TESTNET
  ? `https://eth-kovan.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`
  : `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`
const coinGeckoOptions = {
  apiKey: process.env.APP_COINGECKO_KEY as string,
  baseUrl: process.env.APP_COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

const endpoints = getUrlEndpointForNetwork(NETWORK)
const commonServiceOptions = {
  chainId: CHAIN_ID,
  network: NETWORK,
  endpoints: {
    ...endpoints,
    exchangeApiEndpoint: APP_EXCHANGE_API_ENDPOINT || endpoints.exchangeApi,
    sentryGrpcApiEndpoint: APP_SENTRY_GRPC_ENDPOINT || endpoints.sentryGrpcApi
  },
  metricsEnabled: METRICS_ENABLED || false,
  metricsRegion: app.regionForMetrics
} as ServiceOptions

export const tokenErc20Service = new TokenErc20Service(
  commonServiceOptions,
  alchemyRpcEndpoint
)

export const tokenCoinGeckoService = new TokenCoinGeckoService(
  commonServiceOptions,
  coinGeckoOptions
)

export const bridgeService = new BridgeService(commonServiceOptions)
export const bridgeTransformer = new BridgeTransformer(NETWORK)
export const bankService = new BankService(commonServiceOptions)
export const derivativeService = new DerivativeService(commonServiceOptions)
export const explorerService = new ExplorerService(commonServiceOptions)
export const spotService = new SpotService(commonServiceOptions)
export const tokenService = new TokenService(commonServiceOptions)
export const gasService = new GasService(commonServiceOptions)
export const exchangeService = new ExchangeService(commonServiceOptions)
export const auctionService = new AuctionService(commonServiceOptions)
export const alchemyApiService = new AlchemyApi(alchemyRpcEndpoint)
export const coinGeckoApi = new CoinGeckoApi(coinGeckoOptions)
export const subaccountService = new SubaccountService(commonServiceOptions)
export const referralService = new ReferralService(commonServiceOptions)

export const bankActionService = new BankActionService(
  commonServiceOptions,
  web3Strategy
)
export const derivativeActionService = new DerivativeActionService(
  commonServiceOptions,
  web3Strategy
)
export const spotActionService = new SpotActionService(
  commonServiceOptions,
  web3Strategy
)
export const subaccountActionService = new SubaccountActionService(
  commonServiceOptions,
  web3Strategy
)
export const peggyActionService = new PeggyActionService(
  commonServiceOptions,
  web3Strategy
)
export const tokenErc20ActionService = new TokenErc20ServiceAction(
  commonServiceOptions,
  web3Strategy
)
