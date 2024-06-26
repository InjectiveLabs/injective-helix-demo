import { I18nMessageFunction } from '@/types'

export default {
  campaign: {
    apy: 'APY',
    rank: 'Rank',
    error: 'Error',
    claim: 'Claim',
    volume: 'Volume',
    market: 'Market',
    details: 'Details',
    success: 'Success',
    overall: 'Overall',
    address: 'Address',
    rewards: 'Rewards',
    ongoing: 'Ongoing',
    claimed: 'Claimed',
    endTime: 'End Time',
    title: 'LP Rewards',
    letsGo: "Let's go!",
    liquidity: 'Liquidity',
    dashboard: 'Dashboard',
    round: 'Round {round}',
    activeBots: 'Active Bots',
    allRewards: 'All Rewards',
    estRewards: 'Est. Rewards',
    rewardYield: 'Reward Yield',
    totalVolume: 'Total Volume',
    rewardStats: 'Reward Stats',
    addLiquidity: 'Add Liquidity',
    rewardsRound: 'Rewards/Round',
    myRewards: 'My Rewards',
    rewardsDetails: 'Rewards Details',
    myRewardsCount: 'My Rewards ({rewards})',
    totalRewards: 'Total Rewards',
    campaignRules: 'Campaign Rules',
    readyIn: 'Ready in {hours} Hrs',
    totalLiquidity: 'Total Liquidity',
    rewardsToClaim: 'Rewards To Claim',
    volumeThisRound: 'Volume This Round',
    totalEstRewards: 'Total Est. Rewards',
    dashboardTitle: 'LP Rewards Dashboard',
    endTimeForRound: 'End Time for Round {round}',
    totalRewardsAllTime: 'Total Rewards (All Time)',
    totalRewardsThisRound: 'Total Rewards This Round',
    totalRewardsOfRound: 'Total Rewards of Round {round}',
    helixLpRewardsRound: 'Helix LP Rewards Round {round}',
    successfullyClaimedRewards: 'Succesfuly Claimed Rewards',
    errorAlreadyClaimed: 'This reward has already been claimed.',
    readyInLessThan: 'Ready in less than {time} {interval}',
    campaignNotFound: 'Campaign not found, please try again later.',
    description: 'Earn rewards by trading different spot markets',
    eligibleMarkets: 'Eligible Market for Rewards ',
    lastUpdatedAt: 'Last updated at {date}',
    lastUpdated: ({ named }: I18nMessageFunction) =>
      `Last updated at ${named('date')}`,
    roundIsLive: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([
        named('round1'),
        ' is now live! Check out the new markets added to this round! ',
        'To claim your rewards from ',
        named('round2'),
        ' go to ',
        named('myRewards'),
        ' on the page.'
      ])
  }
}
