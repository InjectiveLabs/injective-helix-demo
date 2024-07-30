import {
  I18nMessageFunction,
  LeaderboardType,
  LeaderboardDuration
} from '@/types'

export default {
  leaderboard: {
    title: 'Leaderboard',
    description: 'Weekly top 100 traders with the highest trading PnL',

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

    volume: {
      keepGoing: 'Keep going 💪',
      currentLeader: 'Current Leader',
      noVolumeData: 'No trading competition results found',
      competitionDuration: ({ named, interpolate }: I18nMessageFunction) =>
        interpolate(['Time Remaining: ', named('duration')])
    },

    tabs: {
      [LeaderboardType.Pnl]: 'PnL Leaderboard',
      [LeaderboardType.Volume]: 'Trading Competition'
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
