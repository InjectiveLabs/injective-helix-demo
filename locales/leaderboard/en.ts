import {
  I18nMessageFunction,
  LeaderboardType,
  LeaderboardDuration
} from '@/types'

export default {
  leaderboard: {
    title: 'Leaderboard',
    description: 'Weekly top 100 traders with the highest trading PnL',

    tabs: {
      [LeaderboardType.Pnl]: 'PnL Leaderboard',
      [LeaderboardType.Volume]: 'Trading Competition'
    },
    duration: {
      [LeaderboardDuration.OneDay]: '1 Day',
      [LeaderboardDuration.All]: 'All Time',
      [LeaderboardDuration.OneWeek]: '1 Week',
      [LeaderboardDuration.OneMonth]: '1 Month'
    },
    timePeriod: ({ named }: I18nMessageFunction) =>
      `Time Period: ${named('startDate')} - ${named('endDate')}`,
    myStats: 'My Stats',
    header: {
      rank: 'Rank',
      address: 'Address',
      tradingPnl: 'Trading PnL (USD)',
      weeklyROI: 'Weekly ROI',
      volume: 'All Markets Trading Volume (USD)'
    },
    share: 'Share',
    viewMore: 'View More'
  }
}
