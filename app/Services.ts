import { CoinGeckoApi } from '@injectivelabs/token-utils'
import { LocalStorage } from '@injectivelabs/utils'
import {
  TokenService,
  TokenPrice,
  peggyGraphQlEndpointForNetwork,
  UiBridgeTransformer,
  Web3Client,
  Web3Composer
} from '@injectivelabs/sdk-ui-ts'
import {
  DenomClient,
  ApolloConsumer,
  ChainGrpcBankApi,
  ChainGrpcDistributionApi,
  ChainGrpcExchangeApi,
  ChainGrpcGovApi,
  ChainGrpcInsuranceFundApi,
  ChainGrpcPeggyApi,
  ChainGrpcMintApi,
  ChainGrpcStakingApi,
  IndexerRestExplorerApi,
  IndexerGrpcExplorerApi,
  ChainGrpcOracleApi,
  IndexerGrpcDerivativesApi,
  IndexerGrpcSpotApi,
  IndexerGrpcAccountApi,
  IndexerRestDerivativesChronosApi,
  IndexerRestSpotChronosApi,
  IndexerRestMarketChronosApi,
  IndexerRestLeaderboardChronosApi,
  IndexerGrpcOracleApi
} from '@injectivelabs/sdk-ts'
import { MsgBroadcaster, Web3Broadcaster } from '@injectivelabs/wallet-ts'
import {
  NETWORK,
  ETHEREUM_CHAIN_ID,
  COIN_GECKO_OPTIONS,
  CHAIN_ID,
  ENDPOINTS,
  FEE_PAYER_PUB_KEY
} from '@/app/utils/constants'
import { alchemyRpcEndpoint, walletStrategy } from '@/app/wallet-strategy'

// Services
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const mintApi = new ChainGrpcMintApi(ENDPOINTS.grpc)
export const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.grpc)
export const distributionApi = new ChainGrpcDistributionApi(ENDPOINTS.grpc)
export const governanceApi = new ChainGrpcGovApi(ENDPOINTS.grpc)
export const insuranceApi = new ChainGrpcInsuranceFundApi(ENDPOINTS.grpc)
export const peggyApi = new ChainGrpcPeggyApi(ENDPOINTS.grpc)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.grpc)
export const oracleApi = new ChainGrpcOracleApi(ENDPOINTS.grpc)

export const indexerExplorerApi = new IndexerGrpcExplorerApi(ENDPOINTS.indexer)
export const indexerAccountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)
export const indexerOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer)
export const indexerRestExplorerApi = new IndexerRestExplorerApi(
  `${ENDPOINTS.indexer}/api/explorer/v1`
)
export const indexerRestDerivativesChronosApi =
  new IndexerRestDerivativesChronosApi(
    `${ENDPOINTS.indexer}/api/chronos/v1/derivative`
  )
export const indexerRestSpotChronosApi = new IndexerRestSpotChronosApi(
  `${ENDPOINTS.indexer}/api/chronos/v1/spot`
)
export const indexerRestLeaderboardChronosApi =
  new IndexerRestLeaderboardChronosApi(
    `${ENDPOINTS.indexer}/api/chronos/v1/leaderboard`
  )
export const indexerRestMarketChronosApi = new IndexerRestMarketChronosApi(
  `${ENDPOINTS.indexer}/api/chronos/v1/market`
)
export const indexerDerivativesApi = new IndexerGrpcDerivativesApi(
  ENDPOINTS.indexer
)
export const indexerSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)

export const apolloConsumer = new ApolloConsumer(
  peggyGraphQlEndpointForNetwork(NETWORK)
)
export const coinGeckoApi = new CoinGeckoApi(COIN_GECKO_OPTIONS)

// Transaction broadcaster
export const msgBroadcastClient = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
  feePayerPubKey: FEE_PAYER_PUB_KEY
})

export const web3Client = new Web3Client({
  rpc: alchemyRpcEndpoint,
  network: NETWORK
})
export const web3Composer = new Web3Composer({
  rpc: alchemyRpcEndpoint,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})
export const web3Broadcaster = new Web3Broadcaster({
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
export const denomClient = new DenomClient(NETWORK)

// UI Services
export const bridgeTransformer = new UiBridgeTransformer(NETWORK)

// Singletons
export const localStorage: LocalStorage = new LocalStorage(
  `inj-dex-v10-${NETWORK}-${process.env.VITE_ENV || 'mainnet'}`
)
