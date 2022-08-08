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
  ApolloConsumer,
  ChainGrpcAuctionApi,
  ChainGrpcBankApi,
  ChainGrpcDistributionApi,
  ChainGrpcExchangeApi,
  ChainGrpcGovApi,
  ChainGrpcInsuranceFundApi,
  ChainGrpcMintApi,
  ChainGrpcOracleApi,
  ChainGrpcPeggyApi,
  ChainGrpcStakingApi,
  IndexerGrpcAccountApi,
  IndexerGrpcDerivativesApi,
  IndexerGrpcExplorerApi,
  IndexerGrpcOracleApi,
  IndexerGrpcSpotApi,
  IndexerRestDerivativesChronosApi,
  IndexerRestExplorerApi,
  IndexerRestSpotChronosApi
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
export const mintApi = new ChainGrpcMintApi(ENDPOINTS.sentryGrpcApi)
export const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.sentryGrpcApi)
export const distributionApi = new ChainGrpcDistributionApi(
  ENDPOINTS.sentryGrpcApi
)
export const governanceApi = new ChainGrpcGovApi(ENDPOINTS.sentryGrpcApi)
export const insuranceApi = new ChainGrpcInsuranceFundApi(
  ENDPOINTS.sentryGrpcApi
)
export const peggyApi = new ChainGrpcPeggyApi(ENDPOINTS.sentryGrpcApi)
export const auctionApi = new ChainGrpcAuctionApi(ENDPOINTS.sentryGrpcApi)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.sentryGrpcApi)
export const oracleApi = new ChainGrpcOracleApi(ENDPOINTS.sentryGrpcApi)
export const exchangeExplorerApi = new IndexerGrpcExplorerApi(
  ENDPOINTS.exchangeApi
)
export const exchangeAccountApi = new IndexerGrpcAccountApi(
  ENDPOINTS.exchangeApi
)
export const exchangeOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.exchangeApi)
export const exchangeRestExplorerApi = new IndexerRestExplorerApi(
  `${ENDPOINTS.exchangeApi}/api/explorer/v1`
)
export const exchangeRestDerivativesChronosApi =
  new IndexerRestDerivativesChronosApi(
    `${
      ENDPOINTS.chronosApi
        ? `${ENDPOINTS.chronosApi}/api/v1/derivative`
        : `${ENDPOINTS.exchangeApi}/api/chronos/v1/derivative`
    }`
  )
export const exchangeRestSpotChronosApi = new IndexerRestSpotChronosApi(
  `${
    ENDPOINTS.chronosApi
      ? `${ENDPOINTS.chronosApi}/api/v1/spot`
      : `${ENDPOINTS.exchangeApi}/api/chronos/v1/spot`
  }`
)
export const exchangeDerivativesApi = new IndexerGrpcDerivativesApi(
  ENDPOINTS.exchangeApi
)
export const exchangeSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.exchangeApi)

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
