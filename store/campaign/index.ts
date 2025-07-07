import { defineStore } from 'pinia'
import { getWasmApi } from '@shared/Service'
import { awaitForAll } from '@injectivelabs/utils'
import { toUtf8, toBase64, fromBase64 } from '@injectivelabs/sdk-ts'
import { getIndexerGrpcCampaignApi } from '@/app/Services'
import { ADMIN_UI_SMART_CONTRACT } from '@/app/utils/constants'
import { fetchLeaderboardCompetitionResults } from '@/app/services/leaderboard'
import {
  LP_CAMPAIGNS,
  campaignNameOverrideMap,
  PAST_LEADERBOARD_CAMPAIGN_NAMES
} from '@/app/data/campaign'
import {
  joinGuild,
  createGuild,
  claimReward,
  submitLeaderboardCompetitionClaim
} from '@/store/campaign/message'
import {
  pollGuildDetails,
  fetchGuildsByTVL,
  fetchGuildDetails,
  fetchUserGuildInfo,
  fetchGuildsByVolume,
  fetchUserIsOptedOutOfRewards
} from '@/store/campaign/guild'
import { LeaderboardType, LeaderboardCampaignStatus } from '@/types'
import type {
  Guild,
  Campaign,
  CampaignV2,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary
} from '@injectivelabs/sdk-ts'
import type { CompetitionResult, CampaignWithScAndData } from '@/types'

type CampaignStoreState = {
  guild?: Guild
  round: Campaign[]
  campaign?: Campaign
  guildsByTVL: Guild[]
  campaigns: Campaign[]
  totalUserCount: number
  guildsByVolume: Guild[]
  totalGuildMember: number
  claimedRewards: string[]
  campaignsInfo: Campaign[]
  userGuildInfo?: GuildMember
  guildMembers: GuildMember[]
  activeCampaign?: CampaignV2
  ownerRewards: CampaignUser[]
  campaignUsers: CampaignUser[]
  userIsOptedOutOfReward: boolean
  ownerCampaignInfo?: CampaignUser
  pnlOrVolumeCampaigns?: CampaignV2[]
  pastPnlOrVolumeCampaigns?: CampaignV2[]
  campaignsWithSc: CampaignWithScAndData[]
  guildCampaignSummary?: GuildCampaignSummary
  leaderboardCompetitionResult?: CompetitionResult
}

const initialStateFactory = (): CampaignStoreState => ({
  userIsOptedOutOfReward: false,
  guild: undefined,
  guildsByTVL: [],
  guildMembers: [],
  totalUserCount: 0,
  campaignUsers: [],
  guildsByVolume: [],
  totalGuildMember: 0,
  round: [],
  campaign: undefined,
  campaigns: [],
  campaignsInfo: [],
  campaignsWithSc: [],
  userGuildInfo: undefined,
  ownerCampaignInfo: undefined,
  ownerRewards: [],
  guildCampaignSummary: undefined,
  claimedRewards: [],
  pnlOrVolumeCampaigns: [],
  pastPnlOrVolumeCampaigns: [],
  activeCampaign: undefined,
  leaderboardCompetitionResult: undefined
})

export const useCampaignStore = defineStore('campaign', {
  state: (): CampaignStoreState => initialStateFactory(),
  getters: {
    latestRoundCampaigns(state) {
      const latestRound = Math.max(...state.round.map(({ roundId }) => roundId))

      return state.round.filter(({ roundId }) => roundId === latestRound)
    },

    campaignsWithUserRewards(state) {
      return state.round.filter(({ userScore }) => userScore)
    }
  },
  actions: {
    joinGuild,
    createGuild,
    claimReward,
    submitLeaderboardCompetitionClaim,

    // guild queries
    pollGuildDetails,
    fetchGuildsByTVL,
    fetchGuildDetails,
    fetchUserGuildInfo,
    fetchGuildsByVolume,
    fetchUserIsOptedOutOfRewards,

    async fetchCampaign({
      skip,
      limit,
      campaignId
    }: {
      skip?: number
      limit?: number
      campaignId: string
    }) {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()
      const sharedWalletStore = useSharedWalletStore()

      const { campaign, paging, users } =
        await indexerGrpcCampaignApi.fetchCampaign({
          limit,
          skip: `${skip}`,
          campaignId,
          accountAddress: sharedWalletStore.injectiveAddress
        })

      campaignStore.$patch({
        campaign,
        campaignUsers: users,
        totalUserCount: paging?.total || 0
      })
    },

    async fetchCampaignsWithSc({
      campaignIds,
      pagination
    }: {
      campaignIds: string[]
      pagination?: { skip?: number; limit?: number }
    }) {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()

      const campaignsWithSc = await Promise.all([
        ...campaignIds.map(async (campaignId: string) => {
          const { campaign } = await indexerGrpcCampaignApi.fetchCampaign({
            campaignId,
            limit: pagination?.limit || 1,
            skip: (pagination?.skip || 0).toString()
          })

          const campaignWithSc = LP_CAMPAIGNS.find(
            (c) => c.campaignId === campaignId
          )!

          return { ...campaign, ...campaignWithSc }
        })
      ])

      campaignStore.$patch({ campaignsWithSc })
    },

    async fetchCampaignRewardsForUser() {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const rewards = await awaitForAll(
        LP_CAMPAIGNS,
        async (campaignWithSc) => {
          const { users, campaign } =
            await indexerGrpcCampaignApi.fetchCampaign({
              limit: 1,
              skip: '0',
              campaignId: campaignWithSc.campaignId,
              accountAddress: sharedWalletStore.injectiveAddress,
              contractAddress: ADMIN_UI_SMART_CONTRACT
            })

          return { user: users[0], campaign }
        }
      )

      const filteredRewards = rewards.filter((reward) => reward.user)

      const claimedCampaignRewards = await awaitForAll(
        filteredRewards,
        async (rew) => {
          const campaignWithSc = LP_CAMPAIGNS.find(
            (c) => c.campaignId === rew.campaign?.campaignId
          )

          const hasClaimed = campaignWithSc
            ? await campaignStore.fetchUserClaimedStatus(
                campaignWithSc.scAddress
              )
            : false

          return hasClaimed ? rew.campaign?.campaignId : undefined
        }
      )

      const campaignsInfo = rewards.map((rew) => rew.campaign)
      const ownerRewards = filteredRewards.map((rew) => rew.user)
      const claimedRewards = claimedCampaignRewards.filter((r) => !!r)

      campaignStore.$patch({
        ownerRewards,
        campaignsInfo,
        claimedRewards
      })
    },

    async fetchUserClaimedStatus(contractAddress: string) {
      const wasmApi = await getWasmApi()

      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.injectiveAddress || !contractAddress) {
        return false
      }

      const response = (await wasmApi.fetchSmartContractState(
        contractAddress,
        toBase64({
          has_claimed: {
            user: sharedWalletStore.injectiveAddress
          }
        })
      )) as unknown as { data: string }

      const userHasClaimed = fromBase64(response.data) as unknown as boolean

      return userHasClaimed
    },

    async fetchActiveStrategiesOnSmartContract(contractAddress?: string) {
      const wasmApi = await getWasmApi()

      if (!contractAddress) {
        return 0
      }

      const response = (await wasmApi.fetchSmartContractState(
        contractAddress,
        toBase64({
          total_strategies: {}
        })
      )) as unknown as { data: Uint8Array }

      return toUtf8(response.data) as unknown as number
    },

    async fetchRound(roundId?: number) {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()
      const sharedWalletStore = useSharedWalletStore()

      const { campaigns } = await indexerGrpcCampaignApi.fetchRound({
        accountAddress: sharedWalletStore.authZOrInjectiveAddress,
        contractAddress: ADMIN_UI_SMART_CONTRACT,
        toRoundId: roundId
      })

      campaignStore.$patch({ round: campaigns })
    },

    async fetchActiveCampaign() {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()

      const { campaigns } = await indexerGrpcCampaignApi.fetchCampaigns({
        status: LeaderboardCampaignStatus.Active
      })

      if (campaigns.length === 0) {
        return
      }

      const pnlOrVolumeCampaigns = campaigns.reduce(
        (pnlOrVolumeCampaigns, campaign) => {
          if (
            ![LeaderboardType.Pnl, LeaderboardType.Volume].includes(
              campaign.type as LeaderboardType
            )
          ) {
            return pnlOrVolumeCampaigns
          }

          return [
            ...pnlOrVolumeCampaigns,
            {
              ...campaign,
              name: campaignNameOverrideMap[campaign.name] || campaign.name
            }
          ]
        },
        [] as CampaignV2[]
      )

      if (pnlOrVolumeCampaigns.length === 0) {
        return
      }

      const [activeCampaign] = pnlOrVolumeCampaigns

      campaignStore.$patch({ activeCampaign })
    },

    async fetchUpcomingCampaigns() {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()

      const { campaigns } = await indexerGrpcCampaignApi.fetchCampaigns({
        status: LeaderboardCampaignStatus.Upcoming
      })

      if (campaigns.length === 0) {
        return
      }

      const pnlOrVolumeCampaigns = campaigns.reduce(
        (pnlOrVolumeCampaigns, campaign) => {
          if (
            ![LeaderboardType.Pnl, LeaderboardType.Volume].includes(
              campaign.type as LeaderboardType
            )
          ) {
            return pnlOrVolumeCampaigns
          }

          return [
            ...pnlOrVolumeCampaigns,
            {
              ...campaign,
              name: campaignNameOverrideMap[campaign.name] || campaign.name
            }
          ]
        },
        [] as CampaignV2[]
      )

      campaignStore.$patch({ pnlOrVolumeCampaigns })
    },

    async fetchPastCampaigns() {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()

      const campaignStore = useCampaignStore()

      const { campaigns: pnlCampaigns } =
        await indexerGrpcCampaignApi.fetchCampaigns({
          type: LeaderboardType.Pnl,
          status: LeaderboardCampaignStatus.Inactive
        })

      const { campaigns: volumeCampaigns } =
        await indexerGrpcCampaignApi.fetchCampaigns({
          type: LeaderboardType.Volume,
          status: LeaderboardCampaignStatus.Inactive
        })

      const campaigns = pnlCampaigns
        .concat(volumeCampaigns)
        .sort((a, b) => Number(b.endDate) - Number(a.endDate))

      if (campaigns.length === 0) {
        return
      }

      const pastPnlOrVolumeCampaigns = campaigns.reduce(
        (pastPnlOrVolumeCampaigns, campaign) => {
          const campaignName =
            campaignNameOverrideMap[campaign.name] || campaign.name

          if (!PAST_LEADERBOARD_CAMPAIGN_NAMES.includes(campaignName)) {
            return pastPnlOrVolumeCampaigns
          }

          return [
            ...pastPnlOrVolumeCampaigns,
            {
              ...campaign,
              name: campaignName
            }
          ]
        },
        [] as CampaignV2[]
      )

      campaignStore.$patch({ pastPnlOrVolumeCampaigns })
    },

    async fetchLeaderboardCompetitionResults(
      campaignName: string,
      injectiveAddress: string
    ) {
      const campaignStore = useCampaignStore()

      campaignStore.$patch({
        leaderboardCompetitionResult: await fetchLeaderboardCompetitionResults(
          campaignName,
          injectiveAddress
        )
      })
    },

    reset() {
      const campaignStore = useCampaignStore()

      campaignStore.$patch({
        round: [],
        userGuildInfo: undefined,
        ownerCampaignInfo: undefined
      })
    }
  }
})
