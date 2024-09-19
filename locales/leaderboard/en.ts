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
        `Time Period: ${named('startDate')} - ${named('endDate')}`,
      lastUpdated: ({ named }: I18nMessageFunction) =>
        `Last Updated: ${named('lastUpdatedDate')}`
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
        title: 'Trade Like a G',
        description:
          'Trade for a chance to win a G-Wagon! From October 1st at 14:00 UTC to October 23rd at 14:00 UTC, trade for your chance to claim one of two G-Wagons—one for the top PnL trader and another for a lucky raffle winner. Every $10 in trading volume earns a raffle entry. For more details, visit the <blog>.',
        smallText: 'Terms and conditions apply.'
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
