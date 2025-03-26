import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  IS_TESTNET
} from '@shared/utils/constant'
import {
  AbacusGrpcApi,
  NeptuneService,
  ChainGrpcAuthZApi,
  IndexerGrpcTradingApi,
  ChainGrpcTendermintApi,
  IndexerGrpcCampaignApi,
  IndexerGrpcArchiverApi,
  IndexerRestLeaderboardChronosApi
} from '@injectivelabs/sdk-ts'
import { LocalStorage } from '@injectivelabs/utils'
import { tokenStaticFactory } from '@shared/Service'
import { tokens } from '@/app/json'
import { HELIX_ENDPOINTS } from '@/app/utils/constants'

tokenStaticFactory.mapRegistry(tokens)

// Services
// https://k8s.mainnet.eu.abacus.injective.network/grpc
export const abacusGrpcApi = new AbacusGrpcApi(
  IS_MAINNET
    ? 'https://k8s.mainnet.eu.abacus.injective.network/grpc' // 'https://k8s.mainnet.eu.abacus.grpc-web.injective.network/grpc'
    : 'https://abacus.injective.cooking/grpc'
)
export const authZApi = new ChainGrpcAuthZApi(ENDPOINTS.grpc)
export const tendermintApi = new ChainGrpcTendermintApi(ENDPOINTS.grpc)

export const indexerGrpcCampaignApi = new IndexerGrpcCampaignApi(
  HELIX_ENDPOINTS.campaign
)
/** TODO remove conditional when resync is done */
export const indexerGrpcTradingApi = new IndexerGrpcTradingApi(
  ENDPOINTS.indexer
)

export const neptuneService = new NeptuneService()

export const indexerGrpcArchiverApi = new IndexerGrpcArchiverApi(
  IS_MAINNET
    ? 'https://k8s.mainnet.archiver.grpc-web.injective.network'
    : IS_TESTNET
    ? 'https://k8s.testnet.archiver.grpc-web.injective.network'
    : ENDPOINTS.indexer
)

export const indexerRestLeaderboardChronosApi =
  new IndexerRestLeaderboardChronosApi(
    `${ENDPOINTS.chronos}/api/chronos/v1/leaderboard`
  )

// Singletons
export const localStorage: LocalStorage = new LocalStorage(
  `inj-helix-v5-${NETWORK}`
)
