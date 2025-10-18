import { LocalStorage } from '@injectivelabs/utils'
import { lazyImportSdkTs } from '@shared/utils/lib'
import { tokenStaticFactory } from '@shared/Service'
import { NeptuneService } from '@injectivelabs/sdk-ts'
import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  IS_TESTNET
} from '@shared/utils/constant'
import { tokens } from '@/app/json'
import { HELIX_ENDPOINTS } from '@/app/utils/constants'
import type {
  AbacusGrpcApi,
  ChainGrpcAuthZApi,
  IndexerGrpcTradingApi,
  ChainGrpcTendermintApi,
  IndexerGrpcCampaignApi,
  IndexerGrpcReferralApi,
  IndexerGrpcArchiverApi,
  IndexerRestLeaderboardChronosApi
} from '@injectivelabs/sdk-ts'

tokenStaticFactory.mapRegistry(tokens as any)

// Services
// https://k8s.mainnet.eu.abacus.injective.network/grpc

export const getAbacusGrpcApi = async () =>
  lazyImportSdkTs<AbacusGrpcApi>({
    className: 'AbacusGrpcApi',
    endpoint: IS_MAINNET
      ? 'https://testing.abacus.injective.cooking/grpc' // 'https://k8s.mainnet.eu.abacus.injective.network/grpc' // 'https://k8s.mainnet.eu.abacus.grpc-web.injective.network/grpc'
      : 'https://abacus.injective.cooking/grpc'
  })

export const getAuthZApi = async () =>
  lazyImportSdkTs<ChainGrpcAuthZApi>({
    className: 'ChainGrpcAuthZApi',
    endpoint: ENDPOINTS.grpc
  })

export const getTendermintApi = async () =>
  lazyImportSdkTs<ChainGrpcTendermintApi>({
    className: 'ChainGrpcTendermintApi',
    endpoint: ENDPOINTS.grpc
  })

export const getIndexerGrpcCampaignApi = async () =>
  lazyImportSdkTs<IndexerGrpcCampaignApi>({
    className: 'IndexerGrpcCampaignApi',
    endpoint: HELIX_ENDPOINTS.campaign
  })
/** TODO remove conditional when resync is done */
export const getIndexerGrpcTradingApi = async () =>
  lazyImportSdkTs<IndexerGrpcTradingApi>({
    className: 'IndexerGrpcTradingApi',
    endpoint: IS_MAINNET
      ? 'https://k8s.mainnet.trading.grpc-web.injective.network'
      : IS_TESTNET
        ? 'https://k8s.testnet.trading.grpc-web.injective.network'
        : ENDPOINTS.indexer
  })

export const getIndexerGrpcReferralApi = async () =>
  lazyImportSdkTs<IndexerGrpcReferralApi>({
    className: 'IndexerGrpcReferralApi',
    endpoint: IS_MAINNET
      ? 'https://k8s.mainnet.referrals.grpc-web.injective.network'
      : 'https://k8s.testnet.referrals.grpc-web.injective.network'
  })

export const getIndexerGrpcArchiverApi = async () =>
  lazyImportSdkTs<IndexerGrpcArchiverApi>({
    className: 'IndexerGrpcArchiverApi',
    endpoint: HELIX_ENDPOINTS.archiver
  })

export const getIndexerRestLeaderboardChronosApi = async () =>
  lazyImportSdkTs<IndexerRestLeaderboardChronosApi>({
    className: 'IndexerRestLeaderboardChronosApi',
    endpoint: `${ENDPOINTS.chronos}/api/chronos/v1/leaderboard`
  })

export const neptuneService = new NeptuneService()
// Singletons
export const localStorage: LocalStorage = new LocalStorage(
  `inj-helix-v5-${NETWORK}`
)
