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
  ServiceOptions,
  MetricsProvider,
  TxProvider,
  PeggyContractActionService
} from '@injectivelabs/ui-common'
import { AlchemyApi } from '@injectivelabs/alchemy-api'
import { CoinGeckoApi } from '@injectivelabs/token-utils'
import { TxProviderBaseOptions } from '@injectivelabs/ui-common/dist/providers/TxProvider'
import {
  IS_TESTNET,
  NETWORK,
  METRICS_ENABLED,
  APP_EXCHANGE_API_ENDPOINT,
  APP_SENTRY_GRPC_ENDPOINT,
  APP_SENTRY_HTTP_ENDPOINT,
  APP_CHRONOS_API_ENDPOINT,
  ETHEREUM_CHAIN_ID
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
const metricsProvider = new MetricsProvider({
  region: app.regionForMetrics,
  appEnv: process.env.APP_ENV,
  nodeEnv: process.env.NODE_ENV
})
// @ts-ignore TODO
const commonServiceOptions = {
  chainId: ETHEREUM_CHAIN_ID,
  network: NETWORK,
  endpoints: {
    ...endpoints,
    chronosApi: APP_CHRONOS_API_ENDPOINT || undefined,
    exchangeApiEndpoint: APP_EXCHANGE_API_ENDPOINT || endpoints.exchangeApi,
    sentryGrpcApiEndpoint: APP_SENTRY_GRPC_ENDPOINT || endpoints.sentryGrpcApi,
    sentryHttpApi: APP_SENTRY_HTTP_ENDPOINT || endpoints.sentryHttpApi
  },
  metricsProvider: METRICS_ENABLED ? metricsProvider : undefined
} as ServiceOptions
const txProvider = new TxProvider({
  ...commonServiceOptions,
  web3Strategy
} as TxProviderBaseOptions)

/* Services */
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

/** Actions */
export const bankActionService = new BankActionService({
  options: commonServiceOptions,
  txProvider
})
export const derivativeActionService = new DerivativeActionService({
  options: commonServiceOptions,
  txProvider
})
export const spotActionService = new SpotActionService({
  options: commonServiceOptions,
  txProvider
})
export const subaccountActionService = new SubaccountActionService({
  options: commonServiceOptions,
  txProvider
})
export const peggyActionService = new PeggyActionService({
  options: commonServiceOptions,
  txProvider
})
export const peggyContractActionService = new PeggyContractActionService({
  options: commonServiceOptions,
  web3Strategy
})
export const tokenErc20ActionService = new TokenErc20ServiceAction({
  options: commonServiceOptions,
  web3Strategy
})
