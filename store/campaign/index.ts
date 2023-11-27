import { defineStore } from 'pinia'
import {
  Guild,
  Campaign,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary,
  MsgExecuteContractCompat,
  toBase64,
  fromBase64
} from '@injectivelabs/sdk-ts'
import { awaitForAll } from '@injectivelabs/utils'
import { joinGuild, createGuild } from '@/store/campaign/message'
import { GUILD_CONTRACT_ADDRESS } from '@/app/utils/constants'
import {
  msgBroadcastClient,
  indexerGrpcCampaignApi,
  chainGrpcWasmApi
} from '@/app/Services'
import { CampaignWithSc, GuildSortBy } from '@/types'
import { CAMPAIGN_LP_ROUNDS } from '~/app/data/guild'

type CampaignStoreState = {
  guild?: Guild
  guildsByTVL: Guild[]
  guildsByVolume: Guild[]
  campaign?: Campaign
  campaigns: Campaign[]
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

    async fetchCampaigns(campaignIds: string[]) {
      const campaignStore = useCampaignStore()

      const campaigns = await awaitForAll(
        campaignIds,
        async (campaignId: string) => {
          const { campaign } = await indexerGrpcCampaignApi.fetchCampaign({
            campaignId,
            limit: 1,
            skip: '1'
          })

          return campaign
        }
      )

      campaignStore.$patch({ campaigns })
    },

    async fetchCampaignRewardsForUser() {
      const walletStore = useWalletStore()
      const campaignStore = useCampaignStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const campaigns = CAMPAIGN_LP_ROUNDS.reduce<CampaignWithSc[]>(
        (campaigns, round) => {
          return [...campaigns, ...round.campaigns]
        },
        []
      )

      const rewards = await awaitForAll(campaigns, async (campaignWithSc) => {
        const { users, campaign } = await indexerGrpcCampaignApi.fetchCampaign({
          limit: 1,
          skip: '0',
          campaignId: campaignWithSc.campaignId,
          accountAddress: walletStore.injectiveAddress
        })

        return { user: users[0], campaign }
      })

      const filteredRewards = rewards.filter((reward) => reward.user)

      const claimedCampaignRewards = await awaitForAll(
        filteredRewards,
        async (rew) => {
          const campaignWithSc = campaigns.find(
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

      campaignStore.$patch({
        ownerRewards,
        campaignsInfo,
        claimedRewards: claimedCampaignRewards.filter((r) => !!r)
      })
    },

    async fetchGuildsByTVL() {
      const campaignStore = useCampaignStore()

      const { guilds, summary } = await indexerGrpcCampaignApi.fetchGuilds({
        sortBy: GuildSortBy.TVL,
        limit: 100,
        campaignContract: GUILD_CONTRACT_ADDRESS
      })

      campaignStore.$patch({
        guildsByTVL: guilds,
        guildCampaignSummary: summary
      })
    },

    async fetchGuildsByVolume() {
      const campaignStore = useCampaignStore()

      const { guilds, summary } = await indexerGrpcCampaignApi.fetchGuilds({
        sortBy: GuildSortBy.Volume,
        limit: 100,
        campaignContract: GUILD_CONTRACT_ADDRESS
      })

      campaignStore.$patch({
        guildsByVolume: guilds,
        guildCampaignSummary: summary
      })
    },

    async fetchUserGuildInfo() {
      const walletStore = useWalletStore()
      const campaignStore = useCampaignStore()

      if (!walletStore.isUserWalletConnected || campaignStore.userGuildInfo) {
        return
      }

      try {
        const { info: userGuildInfo } =
          await indexerGrpcCampaignApi.fetchGuildMember({
            address: walletStore.injectiveAddress,
            campaignContract: GUILD_CONTRACT_ADDRESS
          })

        campaignStore.$patch({
          userGuildInfo
        })
      } catch {
        // silently throw error
      }
    },

    async fetchGuildDetails({
      skip,
      limit,
      guildId
    }: {
      skip?: number
      limit?: number
      guildId: string
    }) {
      const campaignStore = useCampaignStore()

      const { members, guildInfo, paging } =
        await indexerGrpcCampaignApi.fetchGuildMembers({
          skip,
          limit,
          guildId,
          includeGuildInfo: true,
          campaignContract: GUILD_CONTRACT_ADDRESS
        })

      campaignStore.$patch({
        guild: guildInfo,
        guildMembers: members,
        totalGuildMember: paging?.total || 0
      })
    },

    async pollGuildDetails({
      page,
      limit,
      guildId
    }: {
      page?: number
      limit?: number
      guildId: string
    }) {
      const campaignStore = useCampaignStore()

      const { members, guildInfo, paging } =
        await indexerGrpcCampaignApi.fetchGuildMembers({
          limit,
          guildId,
          skip: 0,
          includeGuildInfo: true,
          campaignContract: GUILD_CONTRACT_ADDRESS
        })

      if (page === 1) {
        campaignStore.$patch({
          guildMembers: members
        })
      }

      campaignStore.$patch({
        guild: guildInfo,
        totalGuildMember: paging?.total || 0
      })
    },

    async claimReward(contractAddress: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.queue()
      await walletStore.validate()

      if (!walletStore.address) {
        return
      }

      const message = MsgExecuteContractCompat.fromJSON({
        sender: walletStore.injectiveAddress,
        contractAddress,
        exec: {
          action: 'claim_reward',
          msg: {}
        }
      })

      const reward = await msgBroadcastClient.broadcast({
        msgs: [message],
        injectiveAddress: walletStore.injectiveAddress
      })

      return reward
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
