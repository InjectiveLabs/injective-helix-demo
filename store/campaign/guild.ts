import { exchangeApi } from '@shared/Service'
import { indexerGrpcCampaignApi } from '@/app/Services'
import { GUILD_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { GuildSortBy } from '@/types'

export const fetchUserIsOptedOutOfRewards = async () => {
  const campaignStore = useCampaignStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  const { isOptedOut } = await exchangeApi.fetchIsOptedOutOfRewards(
    sharedWalletStore.injectiveAddress
  )

  campaignStore.$patch({
    userIsOptedOutOfReward: isOptedOut
  })
}

export const fetchGuildsByTVL = async () => {
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
}

export const fetchGuildsByVolume = async () => {
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
}

export const fetchUserGuildInfo = async () => {
  const campaignStore = useCampaignStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || campaignStore.userGuildInfo) {
    return
  }

  try {
    const { info: userGuildInfo } =
      await indexerGrpcCampaignApi.fetchGuildMember({
        address: sharedWalletStore.injectiveAddress,
        campaignContract: GUILD_CONTRACT_ADDRESS
      })

    campaignStore.$patch({
      userGuildInfo
    })
  } catch {
    // silently throw error
  }
}

export const fetchGuildDetails = async ({
  skip,
  limit,
  sortBy,
  guildId
}: {
  skip?: number
  limit?: number
  sortBy?: string
  guildId: string
}) => {
  const campaignStore = useCampaignStore()

  const { members, guildInfo, paging } =
    await indexerGrpcCampaignApi.fetchGuildMembers({
      skip,
      limit,
      sortBy,
      guildId,
      includeGuildInfo: true,
      campaignContract: GUILD_CONTRACT_ADDRESS
    })

  campaignStore.$patch({
    guild: guildInfo,
    guildMembers: members,
    totalGuildMember: paging?.total || 0
  })
}

export const pollGuildDetails = async ({
  page,
  limit,
  sortBy,
  guildId
}: {
  page?: number
  limit?: number
  sortBy: string
  guildId: string
}) => {
  const campaignStore = useCampaignStore()

  const { members, guildInfo, paging } =
    await indexerGrpcCampaignApi.fetchGuildMembers({
      limit,
      sortBy,
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
}
