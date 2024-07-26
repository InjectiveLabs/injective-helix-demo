import { defineStore } from 'pinia'
import {
  Guild,
  Campaign,
  toBase64,
  fromBase64,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary,
  toUtf8
} from '@injectivelabs/sdk-ts'
import { HttpClient, awaitForAll } from '@injectivelabs/utils'
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
import { CampaignWithScAndData } from '@/types'
import { ADMIN_UI_SMART_CONTRACT } from '@/app/utils/constants'

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
  leaderboard: undefined
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
  leaderboard: undefined
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

    async fetchLeaderboard({
      type,
      duration,
      limit
    }: {
      type: string
      duration: string
      limit?: number
    }) {
      const campaignStore = useCampaignStore()
      const httpClient = new HttpClient('https://162.55.103.170:4454/')

      try {
        const LEADERBOARD_SUFFIX = `/api/history/v1/leaderboard/${type}/${duration}`
        console.log('trying')
        const { data: leaderboard } = (await httpClient.get(
          LEADERBOARD_SUFFIX
        )) as {
          data: any
        }

        campaignStore.$patch({ leaderboard })

        console.log({ leaderboard })
      } catch (e: unknown) {
        console.log({ e })
      }
    },

    reset() {
      const campaignStore = useCampaignStore()

      campaignStore.userGuildInfo = undefined
      campaignStore.ownerCampaignInfo = undefined
    }
  }
})
