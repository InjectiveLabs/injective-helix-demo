import { defineStore } from 'pinia'
import {
  Guild,
  Campaign,
  GuildMember,
  CampaignUser,
  GuildCampaignSummary
} from '@injectivelabs/sdk-ts'
import { joinGuild, createGuild } from '@/store/campaign/message'
import { CAMPAIGN_ID, GUILD_CONTRACT_ADDRESS } from 'app/utils/constants'
import { indexerGrpcCampaignApi, indexerGrpcGuildApi } from '@/app/Services'
import { GuildSortBy } from '@/types'

type CampaignStoreState = {
  guild?: Guild
  guildsByTVL: Guild[]
  guildsByVolume: Guild[]
  campaign?: Campaign
  totalUserCount: number
  totalGuildMember: number
  userGuildInfo?: GuildMember
  guildMembers: GuildMember[]
  campaignUsers: CampaignUser[]
  ownerCampaignInfo?: CampaignUser
  guildCampaignSummary?: GuildCampaignSummary
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
  userGuildInfo: undefined,
  ownerCampaignInfo: undefined,
  guildCampaignSummary: undefined
})

export const useCampaignStore = defineStore('campaign', {
  state: (): CampaignStoreState => initialStateFactory(),
  actions: {
    joinGuild,
    createGuild,

    async fetchCampaign({ skip, limit }: { skip?: number; limit?: number }) {
      const campaignStore = useCampaignStore()

      const { campaign, paging, users } =
        await indexerGrpcCampaignApi.fetchCampaign({
          limit,
          skip: `${skip}`,
          campaignId: CAMPAIGN_ID
        })

      campaignStore.$patch({
        campaign,
        campaignUsers: users,
        totalUserCount: paging?.total || 0
      })
    },

    async fetchCampaignOwnerInfo() {
      const walletStore = useWalletStore()
      const campaignStore = useCampaignStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const { users } = await indexerGrpcCampaignApi.fetchCampaign({
        limit: 1,
        skip: '0',
        campaignId: CAMPAIGN_ID,
        accountAddress: walletStore.injectiveAddress
      })

      campaignStore.$patch({
        ownerCampaignInfo: users[0]
      })
    },

    async fetchGuildsByTVL() {
      const campaignStore = useCampaignStore()

      const { guilds, summary } = await indexerGrpcGuildApi.fetchGuilds({
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

      const { guilds, summary } = await indexerGrpcGuildApi.fetchGuilds({
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
          await indexerGrpcGuildApi.fetchGuildMember({
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
        await indexerGrpcGuildApi.fetchGuildMembers({
          limit,
          guildId,
          skip: `${skip}`,
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
        await indexerGrpcGuildApi.fetchGuildMembers({
          limit,
          guildId,
          skip: `${skip}`,
          includeGuildInfo: true,
          campaignContract: GUILD_CONTRACT_ADDRESS
        })

      if (skip === 0) {
        campaignStore.$patch({
          guildMembers: members
        })
      }

      campaignStore.$patch({
        guild: guildInfo,
        totalGuildMember: paging?.total || 0
      })
    },

    reset() {
      const campaignStore = useCampaignStore()

      campaignStore.userGuildInfo = undefined
      campaignStore.ownerCampaignInfo = undefined
    }
  }
})
