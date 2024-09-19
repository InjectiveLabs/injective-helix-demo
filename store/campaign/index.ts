import { defineStore } from 'pinia'
import {
  Guild,
  toUtf8,
  Campaign,
  toBase64,
  CampaignV2,
  fromBase64,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary
} from '@injectivelabs/sdk-ts'
import { awaitForAll } from '@injectivelabs/utils'
import { wasmApi } from '@shared/Service'
import {
  pollGuildDetails,
  fetchGuildsByTVL,
  fetchGuildDetails,
  fetchUserGuildInfo,
  fetchGuildsByVolume,
  fetchUserIsOptedOutOfRewards
} from '@/store/campaign/guild'
import { LP_CAMPAIGNS } from '@/app/data/campaign'
import { indexerGrpcCampaignApi } from '@/app/Services'
import { joinGuild, createGuild, claimReward } from '@/store/campaign/message'
import { ADMIN_UI_SMART_CONTRACT } from '@/app/utils/constants'
import { CampaignWithScAndData, LeaderboardType } from '@/types'

type CampaignStoreState = {
  userIsOptedOutOfReward: boolean
  guild?: Guild
  guildsByTVL: Guild[]
  guildsByVolume: Guild[]
  round: Campaign[]
  campaign?: Campaign
  campaigns: Campaign[]
  campaignsWithSc: CampaignWithScAndData[]
  campaignsInfo: Campaign[]
  totalUserCount: number
  totalGuildMember: number
  userGuildInfo?: GuildMember
  guildMembers: GuildMember[]
  campaignUsers: CampaignUser[]
  ownerCampaignInfo?: CampaignUser
  ownerRewards: CampaignUser[]
  guildCampaignSummary?: GuildCampaignSummary
  claimedRewards: string[]
  pnlOrVolumeCampaigns?: CampaignV2[]
  activeCampaign?: CampaignV2
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
  activeCampaign: undefined
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
    },

    activeCampaignType(state) {
      if (!state.activeCampaign?.type) {
        return undefined
      }

      switch (state.activeCampaign.type) {
        case LeaderboardType.Pnl:
          return LeaderboardType.Pnl
        case LeaderboardType.Volume:
          return LeaderboardType.Volume
        default:
          return undefined
      }
    }
  },
  actions: {
    joinGuild,
    createGuild,
    claimReward,

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
      pagination?: { limit?: number; skip?: number }
    }) {
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
      const sharedWalletStore = useSharedWalletStore()

      const campaignStore = useCampaignStore()
      const { campaigns } = await indexerGrpcCampaignApi.fetchRound({
        accountAddress: sharedWalletStore.injectiveAddress,
        contractAddress: ADMIN_UI_SMART_CONTRACT,
        toRoundId: roundId
      })

      campaignStore.$patch({ round: campaigns })
    },

    async fetchActiveCampaign() {
      const campaignStore = useCampaignStore()

      const { campaigns } = await indexerGrpcCampaignApi.fetchCampaigns({
        active: true
      })

      if (campaigns.length === 0) {
        return
      }

      const pnlOrVolumeCampaigns = campaigns.filter(({ type }: CampaignV2) =>
        [LeaderboardType.Pnl, LeaderboardType.Volume].includes(
          type as LeaderboardType
        )
      )

      // todo: remove after first campaign
      // first campaign MUST be pnl type, so we're forcing any campaign to pnl type for testing purposes
      let [activeCampaign] = pnlOrVolumeCampaigns

      activeCampaign = { ...activeCampaign, type: 'pnl_leaderboard' }

      campaignStore.$patch({ activeCampaign })
    },

    async fetchCampaigns() {
      const campaignStore = useCampaignStore()

      const { campaigns } = await indexerGrpcCampaignApi.fetchCampaigns({})

      if (campaigns.length === 0) {
        return
      }

      const pnlOrVolumeCampaigns = campaigns.filter(({ type }: CampaignV2) =>
        [LeaderboardType.Pnl, LeaderboardType.Volume].includes(
          type as LeaderboardType
        )
      )

      campaignStore.$patch({ pnlOrVolumeCampaigns })
    },

    reset() {
      const campaignStore = useCampaignStore()

      campaignStore.userGuildInfo = undefined
      campaignStore.ownerCampaignInfo = undefined
    }
  }
})
