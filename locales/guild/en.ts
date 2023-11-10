import { I18nMessageFunction } from '@/types'

export default {
  guild: {
    title: 'Guilds',
    description: ({ named }: I18nMessageFunction) =>
      `Earn a share of ${named('amount')} INJ Reward`,

    guilds: 'Guilds',
    participants: 'Participants',
    totalRewards: 'Total rewards',
    currentSeason: 'Current season',

    toast: {
      copiedInvitationLink: 'Invitation link copied to your clipboard.'
    },

    howToParticipate: {
      title: 'How to participate',
      createGuild: {
        title: 'Be a Guild Master and invite others to join you',
        description: 'Hold 10,000 TIA in the wallet to',
        cta: 'Create guild'
      },
      joinGuild: {
        title: 'Join a guild and share rewards with others',
        description:
          'Be a Guild member with an invite link from a Guild master',
        ctaMobile: 'Check out Discord',
        cta: 'Check our Discord to find a community'
      }
    },

    leaderboard: {
      title: 'Leaderboard',
      tab: {
        rankByTVL: 'Rank by TVL',
        rankByVolume: 'Rank by volume'
      },
      guildMembers: 'Guild members',
      fetchNewData: 'Fetch new data',
      invitationLink: 'Invitation link',
      table: {
        tvl: 'TVL',
        rank: 'Rank',
        guild: 'Guild',
        status: 'Status',
        members: 'Members',
        address: 'Address',
        tvlRank: 'TVL rank',
        averageTvl: 'Average TVL',
        volumeRank: 'Volume rank',
        currentRank: 'Current rank',
        tradingVolume: 'Trading volume',
        totalTradingVolume: 'Total trading volume'
      },
      lastUpdated: ({ named }: I18nMessageFunction) =>
        `Last updated at ${named('date')}`
    },

    guildMaster: {
      title: 'Your are the Guild Master',
      noOfMembers: 'No. of members',
      status: 'Status',
      statusTooltip: 'status tooltip placeholder',
      copyLinkToShare: 'Copy this link to share'
    },

    createGuild: {
      title: 'Create a guild',
      name: 'Name of the guild',
      namePlaceholder: 'Enter name',
      thumbnail: 'Select a guild thumbnail',
      masterAddress: 'Guild master address',
      insufficientBalance: 'Insufficient balance',
      findAGuildToJoin: 'Find a guild to join',
      insufficientBalanceDescription: ({ named }: I18nMessageFunction) =>
        `A guild master must have at least ${named('amount')} ${named(
          'symbol'
        )} in the wallet throughout the whole competition, including at time of creation.`,
      characters: 'characters',
      balanceInWallet: ({ named }: I18nMessageFunction) =>
        `${named('symbol')} balance in wallet:`,
      cta: 'Create Guild',
      toast: 'Successfully created guild'
    },

    joinGuild: {
      title: 'Join a guild on Helix',
      description: ({ named }: I18nMessageFunction) =>
        `Join the guild “${named(
          'name'
        )}” on Helix to earn a share of the rewards!`,
      cta: 'Join Guild',
      toast: 'Successfully joined guild'
    },

    alreadyPartOfGuild: {
      title: 'Already a member of a guild',
      description: ({ named }: I18nMessageFunction) =>
        `${named(
          'address'
        )}  is already a part of a guild. Each address can only be a part of one guild during the competition.`
    }
  }
}
