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
    startTrading: 'Start Trading',
    tradeAndWin:
      'Not on the leaderboard yet?  Make winning trades on Helix to claim your spot!',
    rulesTermsAndConditions: 'Rules, Terms, and Conditions',
    blocked: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([
        'Residents of the United States, the United Kingdom, and certain other countries listed in the official ',
        named('terms'),
        ' of the Competition are ineligible to participate in or win the Competition.'
      ]),
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
      unranked: 'Unranked',
      keepGoing: 'Keep going 💪',
      currentLeader: 'Current leader',
      currentLeaderFlame: '🔥🔥',
      currentLeaderMobile: '🔥',
      competitionBeginning: 'The competition is about to begin...',
      competitionHasBegun: 'The competition has begun, good luck!',
      noVolumeData: 'No trading competition results found',
      competitionDuration: ({ named, interpolate }: I18nMessageFunction) =>
        interpolate(['Time Remaining: ', named('duration')]),
      banner: {
        title: 'Trade Like a G',
        blog: 'blog',
        ended: 'Ended',
        description: ({ named, interpolate }: I18nMessageFunction) =>
          interpolate([
            'Trade for a chance to win a G-Wagon! From October 1st at 14:00 UTC to October 23rd at 14:00 UTC, trade for your chance to claim one of two G-Wagons—one for the top PnL trader and another for a lucky raffle winner. Every $10 in trading volume earns a raffle entry. For more details, visit the ',
            named('blog'),
            '.'
          ]),
        termsAndConditionsApply: 'Terms and conditions apply'
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
