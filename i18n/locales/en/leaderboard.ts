import { LeaderboardSubPage, LeaderboardDuration } from './../../../types'

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
    blocked:
      'Residents of the United States, the United Kingdom, and certain other countries listed in the official {terms} of the Competition are ineligible to participate in or win the Competition.',
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
      tradingPnl: 'Trading PnL',

      currentDuration: 'Trading PnL ({duration})',
      timePeriod: 'Time Period: {startDate} - {endDate}',
      lastUpdated: 'Last Updated: {lastUpdatedDate}'
    },

    competition: {
      winner: 'Winner',
      unranked: 'Unranked',
      currentLeaderMobile: '🔥',
      currentLeaderFlame: '🔥🔥',
      keepGoing: 'Keep going 💪',
      tradingVolume: 'Trading Volume',
      currentLeader: 'Current leader',
      noVolumeData: 'No trading competition results found',
      termsAndConditionsApply: 'Terms and conditions apply',
      checkBackLater: "Check back soon to see if you've won!",
      competitionBeginning: 'The competition is about to begin...',
      noPastCompetition: 'There are no past competitions at this time.',
      thanksForParticipating:
        "Thank you for participating! Unfortunately you didn't win this time.",
      noCompetition:
        'There are no active competitions at this time, please check back later!',
      competitionDuration: 'Time Remaining: {duration}',
      firstHourOfCampaign:
        'The competition is now live. The leaderboard will begin displaying campaign stats at {afterFirstHour}.',
      additionalEntriesTooltip:
        'These entries are bonus entries earned by participating in one or more bonus periods during the competition.',
      gwagonBanner: {
        title: 'Trade Like a G',
        blog: 'blog',
        ended: 'Ended',
        description:
          'Trade for a chance to win a G-Wagon! From October 1st at 14:00 UTC to October 22nd at 14:00 UTC, trade for your chance to claim one of two G-Wagons—one for the top PnL trader and another for a lucky giveaway winner. Every $10 in trading volume earns an entry. For more details, visit the {blog}.'
      },
      teslaBanner: {
        title: 'Win a Tesla!',
        blog: 'blog',
        ended: 'Ended',
        description:
          'Trade for a chance to win a Tesla! From November 26th at 15:00 UTC to December 6th at 15:00 UTC, the top trader by PnL will win a Tesla Model 3. For more details, visit the {blog}.',
        top: 'Trade on Helix between now and Friday, December 6 for your chance to {linkDescription}',
        linkDescription: 'win a brand new Tesla!'
      },

      ownYourAssetBanner: {
        title: 'Own Your Assets, Control Your Future.',
        blog: 'blog',
        ended: 'Ended',
        description:
          'Compete for your share of a $50K prize pool on Helix. From February 21st, 2025 at 6pm UTC to March 3rd, 2025 at 6pm UTC, you can trade for a chance to win $1,000 from a $50k prize pool, through a random draw. Every $1,000 in trading volume earns an entry. For more details, visit the {blog}',
        top: 'Trade on Helix and compete for your share of a {linkDescription}',
        linkDescription: '$50K prize pool on Helix!'
      },

      share: {
        raffleTickets: "I've already got {tickets} entries",
        likeAG: 'like a G',
        joinCompetition:
          'Join Helix\'s "like a G" trading competition for a chance to win a Mercedes G-Wagon!'
      },

      winnerModal: {
        getStarted: {
          title: 'Congratulations!',
          description:
            'You are one of the winners of {competition}! To claim your {prize}, please provide additional details.',
          cta: 'Get Started'
        },

        contactInfo: {
          title: 'Contact Information Needed',
          description:
            "To comply with the Competition's Official {terms}, please provide your contact information for verification and prize delivery. Please also review and confirm your agreement to the {privacyPolicy} by clicking below.",
          cta: 'Confirm'
        },

        bannerDescription:
          'Congrats! You are one of the winners of our leaderboard competition. This time you won a {prize}. Click to start claiming your prize!',
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
      allMarketsVolume: 'All Markets Trading Volume (USD)',
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
