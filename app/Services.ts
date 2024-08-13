import {
  TokenStatic,
  ChainGrpcAuthZApi,
  TokenFactoryStatic,
  IndexerGrpcTradingApi,
  ChainGrpcTendermintApi,
  IndexerGrpcCampaignApi,
  IndexerGrpcArchiverApi,
  IndexerRestLeaderboardChronosApi
} from '@injectivelabs/sdk-ts'
import { LocalStorage } from '@injectivelabs/utils'
import { IS_MAINNET, IS_TESTNET } from '@shared/utils/constant'
import { tokens } from '@/app/json'
import { NETWORK, ENDPOINTS } from '@/app/utils/constants'

export const tokenFactoryStatic = new TokenFactoryStatic(
  tokens as TokenStatic[]
)

// Services
export const authZApi = new ChainGrpcAuthZApi(ENDPOINTS.grpc)
export const tendermintApi = new ChainGrpcTendermintApi(ENDPOINTS.grpc)

export const indexerGrpcCampaignApi = new IndexerGrpcCampaignApi(
  ENDPOINTS.campaign
)
/** TODO remove conditional when resync is done */
export const indexerGrpcTradingApi = new IndexerGrpcTradingApi(
  ENDPOINTS.indexer
)

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
  `inj-helix-v3-${NETWORK}`
)
