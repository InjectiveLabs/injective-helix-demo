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
  DerivativeService,
  DerivativeActionService,
  SpotActionService,
  SubaccountActionService
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
import { getWeb3Strategy } from './web3'
import { SubaccountService } from './services/account'
import { DmmService } from './services/dmm'
import { ExchangeService } from './services/exchange'
import { AuctionService } from './services/auction'
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
  metrics: METRICS_ENABLED
    ? {
        region: app.regionForMetrics
      }
    : undefined
}

export const tokenErc20Service = new TokenErc20Service(
  commonServiceOptions,
  alchemyRpcEndpoint
)

export const tokenCoinGeckoService = new TokenCoinGeckoService(
  commonServiceOptions,
  coinGeckoOptions
)

export const bridgeService = new BridgeService(commonServiceOptions)

export const bankService = new BankService(commonServiceOptions)
export const derivativeService = new DerivativeService(commonServiceOptions)
export const spotService = new SpotService(commonServiceOptions)
export const tokenService = new TokenService(commonServiceOptions)
export const gasService = new GasService(commonServiceOptions)
export const dmmService = new DmmService(commonServiceOptions)
export const exchangeService = new ExchangeService(commonServiceOptions)
export const auctionService = new AuctionService(commonServiceOptions)
export const alchemyApiService = new AlchemyApi(alchemyRpcEndpoint)
export const coinGeckoApi = new CoinGeckoApi(coinGeckoOptions)
export const subaccountService = new SubaccountService(commonServiceOptions)

export const bankActionServiceFactory = () => {
  return new BankActionService(commonServiceOptions, getWeb3Strategy())
}

export const derivativeActionServiceFactory = () => {
  return new DerivativeActionService(commonServiceOptions, getWeb3Strategy())
}

export const spotActionServiceFactory = () => {
  return new SpotActionService(commonServiceOptions, getWeb3Strategy())
}

export const subaccountActionServiceFactory = () => {
  return new SubaccountActionService(commonServiceOptions, getWeb3Strategy())
}

export const peggyActionServiceFactory = () => {
  return new PeggyActionService(commonServiceOptions, getWeb3Strategy())
}

export const tokenErc20ActionServiceFactory = () => {
  return new TokenErc20ServiceAction(commonServiceOptions, getWeb3Strategy())
}
