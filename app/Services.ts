import { CoinGeckoApi } from '@injectivelabs/token-utils'
import { LocalStorage } from '@injectivelabs/utils'
import { Web3Client } from '@injectivelabs/sdk-ui-ts/dist/web3'
import {
  MsgBroadcastClient,
  TokenService,
  TokenPrice,
  MetricsProvider,
  peggyGraphQlEndpointForNetwork,
  UiBridgeTransformer
} from '@injectivelabs/sdk-ui-ts'
import {
  ChainGrpcAuctionApi,
  ChainGrpcBankApi,
  ExchangeRestExplorerApi,
  ExchangeGrpcExplorerApi,
  ApolloConsumer,
  ChainGrpcExchangeApi,
  ChainGrpcOracleApi,
  ExchangeGrpcDerivativesApi,
  ExchangeGrpcSpotApi,
  ExchangeGrpcAccountApi,
  ExchangeRestDerivativesChronosApi,
  ExchangeRestSpotChronosApi,
  ExchangeGrpcOracleApi
} from '@injectivelabs/sdk-ts/dist/client'
import {
  NETWORK,
  METRICS_ENABLED,
  ETHEREUM_CHAIN_ID,
  COIN_GECKO_OPTIONS,
  CHAIN_ID,
  ENDPOINTS
} from './utils/constants'
import { walletStrategy } from './wallet-strategy'

const metricsProvider = new MetricsProvider({
  region: 'en' /* TODO */,
  appEnv: process.env.APP_ENV,
  nodeEnv: process.env.NODE_ENV
})
const apiOptions = {
  chainId: CHAIN_ID,
  ethereumChainId: ETHEREUM_CHAIN_ID,
  network: NETWORK,
  endpoints: ENDPOINTS,
  metricsProvider: METRICS_ENABLED ? metricsProvider : undefined
}

// Services
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.sentryGrpcApi)
export const auctionApi = new ChainGrpcAuctionApi(ENDPOINTS.sentryGrpcApi)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.sentryGrpcApi)
export const oracleApi = new ChainGrpcOracleApi(ENDPOINTS.sentryGrpcApi)
export const exchangeExplorerApi = new ExchangeGrpcExplorerApi(
  ENDPOINTS.exchangeApi
)
export const exchangeAccountApi = new ExchangeGrpcAccountApi(
  ENDPOINTS.exchangeApi
)
export const exchangeOracleApi = new ExchangeGrpcOracleApi(
  ENDPOINTS.exchangeApi
)
export const exchangeRestExplorerApi = new ExchangeRestExplorerApi(
  `${ENDPOINTS.exchangeApi}/api/explorer/v1`
)
export const exchangeRestDerivativesChronosApi =
  new ExchangeRestDerivativesChronosApi(
    `${
      ENDPOINTS.chronosApi
        ? `${ENDPOINTS.chronosApi}/api/v1/derivative`
        : `${ENDPOINTS.exchangeApi}/api/chronos/v1/derivative`
    }`
  )
export const exchangeRestSpotChronosApi = new ExchangeRestSpotChronosApi(
  `${
    ENDPOINTS.chronosApi
      ? `${ENDPOINTS.chronosApi}/api/v1/spot`
      : `${ENDPOINTS.exchangeApi}/api/chronos/v1/spot`
  }`
)
export const exchangeDerivativesApi = new ExchangeGrpcDerivativesApi(
  ENDPOINTS.exchangeApi
)
export const exchangeSpotApi = new ExchangeGrpcSpotApi(ENDPOINTS.exchangeApi)

export const apolloConsumer = new ApolloConsumer(
  peggyGraphQlEndpointForNetwork(NETWORK)
)
export const coinGeckoApi = new CoinGeckoApi(COIN_GECKO_OPTIONS)

// Transaction broadcaster
export const msgBroadcastClient = new MsgBroadcastClient({
  ...apiOptions,
  walletStrategy
})
export const web3Client = new Web3Client({
  // @ts-ignore
  walletStrategy,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})

// Token Services
export const tokenService = new TokenService({
  chainId: CHAIN_ID,
  network: NETWORK
})
export const tokenPrice = new TokenPrice(COIN_GECKO_OPTIONS)

// UI Services
export const bridgeTransformer = new UiBridgeTransformer(NETWORK)

// Singletons
export const localStorage: LocalStorage = new LocalStorage(
  `inj-dex-v8-${NETWORK}-${process.env.APP_ENV || 'mainnet'}`
)
