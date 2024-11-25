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
    screenshot: 'Screenshot',
    startTrading: 'Start Trading',
    tradeAndWin:
      'Not on the leaderboard yet?  Make winning trades on Helix to claim your spot!',
    timeStamp: 'Time Stamp',
    helix: 'helixapp.com',
    privacyPolicy: 'Privacy Policy',
    rulesTermsAndConditions: 'Rules, Terms, and Conditions',
    blocked: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([
        'Residents of the United States, the United Kingdom, and certain other countries listed in the official ',
        named('terms'),
        ' of the Competition are ineligible to participate in or win the Competition.'
      ]),
    refresh: 'The leaderboard refreshes at the top of each hour',
    pnl: {
      allTime: 'Since August 1, 2024 00:00 UTC',
      duration: {
        [LeaderboardDuration.OneDay]: 'Today',
        [LeaderboardDuration.All]: 'All Time',
        [LeaderboardDuration.OneWeek]: 'This Week',
        [LeaderboardDuration.OneMonth]: 'This Month'
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
      winner: 'Winner',
      unranked: 'Unranked',
      keepGoing: 'Keep going 💪',
      currentLeader: 'Current leader',
      currentLeaderFlame: '🔥🔥',
      currentLeaderMobile: '🔥',
      competitionBeginning: 'The competition is about to begin...',
      competitionMaintenance:
        'Crunching the latest numbers for you, the leaderboard will be back up shortly ...',
      noVolumeData: 'No trading competition results found',
      thanksForParticipating:
        'Thank you for participating! Unfortunately you didn’t win this time.',
      checkBackLater: "Check back soon to see if you've won!",
      noCompetition:
        'There are no active competitions at this time, please check back later!',
      noPastCompetition: 'There are no past competitions at this time.',
      competitionDuration: ({ named, interpolate }: I18nMessageFunction) =>
        interpolate(['Time Remaining: ', named('duration')]),
      firstHourOfCampaign: ({ named }: I18nMessageFunction) =>
        `The competition is now live. The leaderboard will begin displaying campaign stats at ${named(
          'afterFirstHour'
        )}.`,
      additionalEntriesTooltip:
        'These entries are bonus entries earned by participating in one or more bonus periods during the competition.',
      termsAndConditionsApply: 'Terms and conditions apply',
      banner: {
        title: 'Trade Like a G',
        blog: 'blog',
        ended: 'Ended',
        description: ({ named, interpolate }: I18nMessageFunction) =>
          interpolate([
            'Trade for a chance to win a G-Wagon! From October 1st at 14:00 UTC to October 22nd at 14:00 UTC, trade for your chance to claim one of two G-Wagons—one for the top PnL trader and another for a lucky giveaway winner. Every $10 in trading volume earns an entry. For more details, visit the ',
            named('blog'),
            '.'
          ])
      },
      share: {
        raffleTickets: ({ named, interpolate }: I18nMessageFunction) =>
          interpolate(["I've already got ", named('tickets'), ' entries']),
        likeAG: 'like a G',
        joinCompetition:
          'Join Helix\'s "like a G" trading competition for a chance to win a Mercedes G-Wagon!'
      },

      winnerModal: {
        getStarted: {
          title: 'Congratulations!',
          description: ({ named }: I18nMessageFunction) =>
            `You are one of the winners of 'Trade Like a G'! To claim your ${named(
              'prize'
            )}, please provide additional details.`,
          cta: 'Get Started'
        },

        contactInfo: {
          title: 'Contact Information Needed',
          description: ({ named, interpolate }: I18nMessageFunction) =>
            interpolate([
              "To comply with the Competition's Official ",
              named('terms'),
              ', please provide your contact information for verification and prize delivery. Please also review and confirm your agreement to the ',
              named('privacyPolicy'),
              ' by clicking below',
              '.'
            ]),
          cta: 'Confirm'
        },

        bannerDescription: ({ named }: I18nMessageFunction) =>
          `Congrats! You are one of the winners of our leaderboard competition. This time you won a ${named(
            'prize'
          )}. Click to start claiming your prize!`,
        namePlaceholder: 'Your first and last name',
        emailPlaceholder: 'Your email address',
        receivedInformation:
          "We've received your information. Our team will reach out to you shortly."
      }
    },

    tabs: {
      [LeaderboardSubPage.Pnl]: 'PnL Leaderboard',
      [LeaderboardSubPage.Competition]: 'Trading Competition',
      [LeaderboardSubPage.PastCompetitions]: 'Past Competitions'
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

    footer: {
      onlyTop100:
        'The leaderboard only displays up to the top 100 participants.',
      onlyTop100Connect: 'To view your stats, connect your wallet.'
    },

    myStats: 'My Stats',
    viewMore: 'View More'
  }
}
