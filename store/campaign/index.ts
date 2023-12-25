import { defineStore } from 'pinia'
import {
  Guild,
  Campaign,
  toBase64,
  fromBase64,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary
} from '@injectivelabs/sdk-ts'
import { awaitForAll } from '@injectivelabs/utils'
import {
  pollGuildDetails,
  fetchGuildsByTVL,
  fetchGuildDetails,
  fetchUserGuildInfo,
  fetchGuildsByVolume,
  fetchUserIsOptedOutOfRewards
} from '@/store/campaign/guild'
import { LP_CAMPAIGNS } from '@/app/data/campaign'
import { chainGrpcWasmApi, indexerGrpcCampaignApi } from '@/app/Services'
import { joinGuild, createGuild, claimReward } from '@/store/campaign/message'
import { CampaignWithScAndData } from '@/types'

type CampaignStoreState = {
  userIsOptedOutOfReward: boolean
  guild?: Guild
  guildsByTVL: Guild[]
  guildsByVolume: Guild[]
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
  campaign: undefined,
  campaigns: [],
  campaignsInfo: [],
  campaignsWithSc: [],
  userGuildInfo: undefined,
  ownerCampaignInfo: undefined,
  ownerRewards: [],
  guildCampaignSummary: undefined,
  claimedRewards: []
})

export const useCampaignStore = defineStore('campaign', {
  state: (): CampaignStoreState => initialStateFactory(),
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

      const { campaign, paging, users } =
        await indexerGrpcCampaignApi.fetchCampaign({
          limit,
          skip: `${skip}`,
          campaignId
        })

      campaignStore.$patch({
        campaign,
        campaignUsers: users,
        totalUserCount: paging?.total || 0
      })
    },

    async fetchCampaignOwnerInfo(campaignId: string) {
      const walletStore = useWalletStore()
      const campaignStore = useCampaignStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const { users } = await indexerGrpcCampaignApi.fetchCampaign({
        limit: 1,
        skip: '0',
        campaignId,
        accountAddress: walletStore.injectiveAddress
      })

      campaignStore.$patch({
        ownerCampaignInfo: users[0]
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
      const walletStore = useWalletStore()
      const campaignStore = useCampaignStore()

      if (!walletStore.isUserWalletConnected) {
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
              accountAddress: walletStore.injectiveAddress
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
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress || !contractAddress) {
        return false
      }

      const response = (await chainGrpcWasmApi.fetchSmartContractState(
        contractAddress,
        toBase64({
          has_claimed: {
            user: walletStore.injectiveAddress
          }
        })
      )) as unknown as { data: string }

      const userHasClaimed = fromBase64(response.data) as unknown as boolean

      return userHasClaimed
    },

    reset() {
      const campaignStore = useCampaignStore()

      campaignStore.userGuildInfo = undefined
      campaignStore.ownerCampaignInfo = undefined
    }
  }
})
