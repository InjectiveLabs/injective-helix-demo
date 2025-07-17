import { LeaderboardSubPage, LeaderboardDuration } from '@/types'

export default {
  leaderboard: {
    myStats: 'My Stats',
    title: 'Leaderboard',
    viewMore: 'View More',
    helix: 'helixapp.com',
    timestamp: 'Timestamp',
    startTrading: 'Start Trading',
    privacyPolicy: 'Privacy Policy',
    rulesTermsAndConditions: 'Rules, Terms, and Conditions',
    refresh: 'The leaderboard refreshes at the top of each hour',
    description:
      'Helix ranks the top traders based on their on-chain trading PnL',
    tradeAndWin:
      'Not on the leaderboard yet?  Make winning trades on Helix to claim your spot!',
    blocked:
      'Residents of the United States, the United Kingdom, and certain other countries listed in the official {terms} of the Competition are ineligible to participate in or win the Competition.',

    tabs: {
      [LeaderboardSubPage.Pnl]: 'PnL Leaderboard',
      [LeaderboardSubPage.Competition]: 'Trading Competition',
      [LeaderboardSubPage.PastCompetitions]: 'Past Competitions'
    },

    pnl: {
      share: 'Share',
      tradingPnl: 'Trading PnL',
      noPnlData: 'No PnL results found',
      allTime: 'Since August 1, 2024 00:00 UTC',
      currentDuration: 'Trading PnL ({duration})',
      lastUpdated: 'Last Updated: {lastUpdatedDate}',
      timePeriod: 'Time Period: {startDate} - {endDate}',
      duration: {
        [LeaderboardDuration.OneDay]: 'Today',
        [LeaderboardDuration.All]: 'All Time',
        [LeaderboardDuration.OneWeek]: 'This Week',
        [LeaderboardDuration.OneMonth]: 'This Month'
      }
    },

    competition: {
      winner: 'Winner',
      unranked: 'Unranked',
      currentLeaderMobile: '🔥',
      currentLeaderFlame: '🔥🔥',
      keepGoing: 'Keep going 💪',
      tradingVolume: 'Trading Volume',
      currentLeader: 'Current leader',
      competitionDuration: 'Time Remaining: {duration}',
      noVolumeData: 'No trading competition results found',
      termsAndConditionsApply: 'Terms and conditions apply',
      checkBackLater: "Check back soon to see if you've won!",
      competitionBeginning: 'The competition is about to begin...',
      noPastCompetition: 'There are no past competitions at this time.',
      thanksForParticipating:
        "Thank you for participating! Unfortunately you didn't win this time.",
      noCompetition:
        'There are no active competitions at this time, please check back later!',
      firstHourOfCampaign:
        'The competition is now live. The leaderboard will begin displaying campaign stats at {afterFirstHour}.',
      additionalEntriesTooltip:
        'These entries are bonus entries earned by participating in one or more bonus periods during the competition.',

      winnerModal: {
        emailPlaceholder: 'Your email address',
        namePlaceholder: 'Your first and last name',
        bannerDescription:
          'Congrats! You are one of the winners of our leaderboard competition. This time you won a {prize}. Click to start claiming your prize!',

        getStarted: {
          cta: 'Get Started',
          title: 'Congratulations!',
          description:
            'You are one of the winners of {competition}! To claim your {prize}, please provide additional details.'
        },

        contactInfo: {
          cta: 'Confirm',
          title: 'Contact Information Needed',
          description:
            "To comply with the Competition's Official {terms}, please provide your contact information for verification and prize delivery. Please also review and confirm your agreement to the {privacyPolicy} by clicking below."
        }
      }
    },

    header: {
      rank: 'Rank',
      entries: 'Entries',
      address: 'Address',
      weeklyROI: 'Weekly ROI',
      volume: 'Trading Volume (USD)',
      tradingPnl: 'Trading PnL (USD)',
      numberOfEntries: 'Number of Entries',
      allMarketsVolume: 'All Markets Trading Volume (USD)'
    },

    footer: {
      onlyTop100Connect: 'To view your stats, connect your wallet.',
      onlyTop100:
        'The leaderboard only displays up to the top 100 participants.'
    }
  }
}
