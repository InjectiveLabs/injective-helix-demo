import { FaucetService } from './app/Faucet'
import { Web3Client } from './app/Web3Client'
import { PythService } from './app/pythClient'
import { lazyImportSdkTs } from './../utils/lib'
import { InjNameService } from './app/nameService'
import { UiApiService } from './../providers/uiApi'
import { InjBonfidaNameService } from './app/bonfida'
import { SharedTokenClient } from './app/tokenClient'
import { Web3GatewayService } from './app/Web3Gateway'
import { alchemyRpcEndpoint } from './../wallet/alchemy'
import { CachePythService } from './app/cachePythClient'
import { CoinGeckoApiService } from './app/CoinGeckoApi'
import { TokenStaticFactory } from '@injectivelabs/sdk-ts'
import { SpotCacheApi } from './../providers/cacheApi/spot'
import { TokenCacheApi } from './../providers/cacheApi/token'
import { StakingCacheApi } from './../providers/cacheApi/staking'
import { TokenPrice as TokenPriceService } from './app/tokenPrice'
import { DerivativeCacheApi } from './../providers/cacheApi/derivative'
import { SharedTokenClientStatic } from './../Service/app/SharedTokenClientStatic'
import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  COINGECKO_KEY,
  MITO_API_ENDPOINT
} from './../utils/constant'
import type {
  ChainGrpcIbcApi,
  ChainGrpcGovApi,
  ChainGrpcMintApi,
  ChainGrpcBankApi,
  ChainGrpcWasmApi,
  ChainRestAuthApi,
  ChainRestWasmApi,
  ChainGrpcPeggyApi,
  ChainGrpcOracleApi,
  IndexerGrpcMitoApi,
  IndexerGrpcSpotApi,
  ChainGrpcStakingApi,
  ChainGrpcAuctionApi,
  ChainGrpcExchangeApi,
  IndexerGrpcOracleApi,
  IndexerGrpcAccountApi,
  IndexerGrpcAuctionApi,
  IndexerGrpcExplorerApi,
  IndexerRestExplorerApi,
  ChainGrpcDistributionApi,
  ChainGrpcTokenFactoryApi,
  ChainGrpcInsuranceFundApi,
  IndexerGrpcDerivativesApi,
  IndexerRestSpotChronosApi,
  IndexerGrpcInsuranceFundApi,
  IndexerRestMarketChronosApi,
  IndexerGrpcAccountPortfolioApi,
  IndexerRestDerivativesChronosApi
} from '@injectivelabs/sdk-ts'

/*
 * Runtime proxy helper to expose instance-like APIs expected by the app
 * while keeping lazy loading from get*Api() functions.
 */
function createApiProxy<T>(getter: () => Promise<T>): T {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        // Return a function that resolves the real instance then calls its method
        return (...args: any[]) =>
          getter().then((api: any) => api[prop as keyof T](...args))
      }
    }
  ) as unknown as T
}

// Proxied instances expected by the app (declared after getters to avoid TDZ)

export const getBankApi = () =>
  lazyImportSdkTs<ChainGrpcBankApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcBankApi'
  })

export const getIbcApi = () =>
  lazyImportSdkTs<ChainGrpcIbcApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcIbcApi'
  })

export const getMintApi = () =>
  lazyImportSdkTs<ChainGrpcMintApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcMintApi'
  })

export const getWasmApi = () =>
  lazyImportSdkTs<ChainGrpcWasmApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcWasmApi'
  })

export const getTokenFactoryApi = () =>
  lazyImportSdkTs<ChainGrpcTokenFactoryApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcTokenFactoryApi'
  })

export const getStakingApi = () =>
  lazyImportSdkTs<ChainGrpcStakingApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcStakingApi'
  })

export const getExchangeApi = () =>
  lazyImportSdkTs<ChainGrpcExchangeApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcExchangeApi'
  })

export const getDistributionApi = () =>
  lazyImportSdkTs<ChainGrpcDistributionApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcDistributionApi'
  })

export const getInsuranceFundsApi = () =>
  lazyImportSdkTs<ChainGrpcInsuranceFundApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcInsuranceFundApi'
  })

export const getOracleApi = () =>
  lazyImportSdkTs<ChainGrpcOracleApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcOracleApi'
  })

export const getGovernanceApi = () =>
  lazyImportSdkTs<ChainGrpcGovApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcGovApi'
  })

export const getAuctionApi = () =>
  lazyImportSdkTs<ChainGrpcAuctionApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcAuctionApi'
  })

export const getPeggyApi = () =>
  lazyImportSdkTs<ChainGrpcPeggyApi>({
    endpoint: ENDPOINTS.grpc,
    className: 'ChainGrpcPeggyApi'
  })

export const getIndexerMitoApi = () =>
  lazyImportSdkTs<IndexerGrpcMitoApi>({
    endpoint: MITO_API_ENDPOINT,
    className: 'IndexerGrpcMitoApi'
  })

export const getIndexerSpotApi = () =>
  lazyImportSdkTs<IndexerGrpcSpotApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcSpotApi'
  })

export const getIndexerDerivativesApi = () =>
  lazyImportSdkTs<IndexerGrpcDerivativesApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcDerivativesApi'
  })

export const getIndexerAccountApi = () =>
  lazyImportSdkTs<IndexerGrpcAccountApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcAccountApi'
  })

export const getIndexerAccountPortfolioApi = () =>
  lazyImportSdkTs<IndexerGrpcAccountPortfolioApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcAccountPortfolioApi'
  })

export const getIndexerFundsApi = () =>
  lazyImportSdkTs<IndexerGrpcInsuranceFundApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcInsuranceFundApi'
  })

export const getIndexerOracleApi = () =>
  lazyImportSdkTs<IndexerGrpcOracleApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcOracleApi'
  })

export const getIndexerExplorerApi = () =>
  lazyImportSdkTs<IndexerGrpcExplorerApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcExplorerApi'
  })

export const getRestAuthApi = () =>
  lazyImportSdkTs<ChainRestAuthApi>({
    endpoint: ENDPOINTS.rest,
    className: 'ChainRestAuthApi'
  })

export const getRestWasmApi = () =>
  lazyImportSdkTs<ChainRestWasmApi>({
    endpoint: ENDPOINTS.rest,
    className: 'ChainRestWasmApi'
  })

export const getIndexerRestExplorerApi = () =>
  lazyImportSdkTs<IndexerRestExplorerApi>({
    className: 'IndexerRestExplorerApi',
    endpoint: `${IS_MAINNET ? 'https://k8s.global.mainnet.explorer.grpc-web.injective.network' : ENDPOINTS.explorer}/api/explorer/v1`
  })

export const getIndexerRestDerivativeChronosApi = () =>
  lazyImportSdkTs<IndexerRestDerivativesChronosApi>({
    className: 'IndexerRestDerivativesChronosApi',
    endpoint: `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/derivative`
  })

export const getIndexerRestSpotChronosApi = () =>
  lazyImportSdkTs<IndexerRestSpotChronosApi>({
    className: 'IndexerRestSpotChronosApi',
    endpoint: `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/spot`
  })

export const getIndexerRestMarketChronosApi = () =>
  lazyImportSdkTs<IndexerRestMarketChronosApi>({
    className: 'IndexerRestMarketChronosApi',
    endpoint: IS_MAINNET
      ? `https://k8s.global.mainnet.chart.grpc-web.injective.network/api/chart/v1/market`
      : `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/market`
  })

export const getIndexerAuctionApi = () =>
  lazyImportSdkTs<IndexerGrpcAuctionApi>({
    endpoint: ENDPOINTS.indexer,
    className: 'IndexerGrpcAuctionApi'
  })

// Proxied instances expected by the app (after getter functions)
export const indexerSpotApi = createApiProxy(getIndexerSpotApi)
export const indexerDerivativesApi = createApiProxy(getIndexerDerivativesApi)
export const indexerAccountApi = createApiProxy(getIndexerAccountApi)
export const indexerAccountPortfolioApi = createApiProxy(
  getIndexerAccountPortfolioApi
)
export const indexerOracleApi = createApiProxy(getIndexerOracleApi)
export const indexerExplorerApi = createApiProxy(getIndexerExplorerApi)
export const indexerAuctionApi = createApiProxy(getIndexerAuctionApi)
export const indexerRestExplorerApi = createApiProxy(
  getIndexerRestExplorerApi
)
export const indexerRestDerivativeChronosApi = createApiProxy(
  getIndexerRestDerivativeChronosApi
)
export const indexerRestSpotChronosApi = createApiProxy(
  getIndexerRestSpotChronosApi
)
export const indexerRestMarketChronosApi = createApiProxy(
  getIndexerRestMarketChronosApi
)
export const exchangeApi = createApiProxy(getExchangeApi)
export const stakingApi = createApiProxy(getStakingApi)
export const wasmApi = createApiProxy(getRestWasmApi)
export const restAuthApi = createApiProxy(getRestAuthApi)
export const mitoApi = createApiProxy(getIndexerMitoApi)

export const uiApi = new UiApiService(ENDPOINTS.uiApi)
export const spotCacheApi = new SpotCacheApi(ENDPOINTS.uiApi)
export const tokenCacheApi = new TokenCacheApi(ENDPOINTS.uiApi)
export const stakingCacheApi = new StakingCacheApi(ENDPOINTS.uiApi)
export const derivativeCacheApi = new DerivativeCacheApi(ENDPOINTS.uiApi)

export const pythService = new PythService()
export const cachePythService = new CachePythService()

export const tokenPriceService = new TokenPriceService(NETWORK, {
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

export const coinGeckoApi = new CoinGeckoApiService({
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

// name service
export const injNameService = new InjNameService()
export const injBonfidaNameService = new InjBonfidaNameService()

export const sharedTokenClient = new SharedTokenClient()
export const sharedTokenClientStatic = new SharedTokenClientStatic()

export const web3Client = new Web3Client({
  network: NETWORK,
  rpc: alchemyRpcEndpoint
})

export const faucetService = new FaucetService()
export const web3GatewayService = new Web3GatewayService()
export const tokenStaticFactory = new TokenStaticFactory([])
