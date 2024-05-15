import {
  ChainGrpcAuthZApi,
  IndexerGrpcTradingApi,
  ChainGrpcTendermintApi,
  IndexerGrpcCampaignApi,
  IndexerGrpcArchiverApi,
  IndexerRestLeaderboardChronosApi
} from '@injectivelabs/sdk-ts'
import { LocalStorage } from '@injectivelabs/utils'
import { TokenStatic, TokenFactoryStatic } from '@injectivelabs/token-metadata'
import { NETWORK, ENDPOINTS } from '@/app/utils/constants'
import tokens from '@/app/data/tokens.json'

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
  'https://devnet.api.injective.dev'
)

export const indexerRestLeaderboardChronosApi =
  new IndexerRestLeaderboardChronosApi(
    `${ENDPOINTS.chronos}/api/chronos/v1/leaderboard`
  )

// Singletons
export const localStorage: LocalStorage = new LocalStorage(
  `inj-helix-v2-${NETWORK}`
)
