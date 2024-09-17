import {
  LeaderboardSubPage,
  I18nMessageFunction,
  LeaderboardDuration
} from '@/types'

export default {
  leaderboard: {
    title: 'Leaderboard',
    description: 'Top Traders on Helix',
    unranked: 'Unranked',
    getTrading: 'Get Trading',
    getTradingDescription: 'Do you want to see yourself here? Get Trading!',

    pnl: {
      duration: {
        [LeaderboardDuration.OneDay]: '1 Day',
        [LeaderboardDuration.All]: 'All Time',
        [LeaderboardDuration.OneWeek]: '1 Week',
        [LeaderboardDuration.OneMonth]: '1 Month'
      },
      share: 'Share',
      noPnlData: 'No PnL results found',

      currentDuration: ({ named }: I18nMessageFunction) =>
        `Trading PnL (${named('duration')})`,
      timePeriod: ({ named }: I18nMessageFunction) =>
        `Time Period: ${named('startDate')} - ${named('endDate')}`
    },

    competition: {
      keepGoing: 'Keep going 💪',
      currentLeader: 'Current leader',
      currentLeaderFlame: '🔥🔥',
      currentLeaderMobile: '🔥',
      noVolumeData: 'No trading competition results found',
      competitionDuration: ({ named, interpolate }: I18nMessageFunction) =>
        interpolate(['Time Remaining: ', named('duration')]),
      banner: {
        title: 'Trade & win a Mercedes G Wagon',
        description:
          'Placeholder banner for now bitcoin ethereum dogecoin litecoin. WAX stellar nexo cardano BitTorrent audius. Velas dash ethereum kadena horizen.'
      }
    },

    tabs: {
      [LeaderboardSubPage.Pnl]: 'PnL Leaderboard',
      [LeaderboardSubPage.Competition]: 'Trading Competition'
    },

    header: {
      rank: 'Rank',
      address: 'Address',
      tradingPnl: 'Trading PnL (USD)',
      weeklyROI: 'Weekly ROI',
      allMarkestVolume: 'All Markets Trading Volume (USD)',
      volume: 'Trading Volume (USD)',
      numberOfEntries: 'Number of Entries',
      entries: 'Entries'
    },

    myStats: 'My Stats',
    viewMore: 'View More'
  }
}
