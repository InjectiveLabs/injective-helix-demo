import {
  LiquidityTableColumn,
  LiquidityDashboardTableColumn
} from './../../../types'

export default {
  campaign: {
    table: {
      liquidity: {
        [LiquidityTableColumn.Market]: 'Market',
        [LiquidityTableColumn.Rewards]: 'Rewards',
        [LiquidityTableColumn.ActiveBots]: 'Active Bots',
        [LiquidityTableColumn.Volume]: 'Volume'
      },
      dashboard: {
        [LiquidityDashboardTableColumn.Market]: 'Market',
        [LiquidityDashboardTableColumn.Volume]: 'Volume',
        [LiquidityDashboardTableColumn.Rewards]: 'Rewards',
        [LiquidityDashboardTableColumn.EstRewards]: 'Est. Rewards'
      }
    },

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
    noActiveCampaigns: 'No active campaigns',
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
    rewardsPending:
      'LP Rewards Pending: Rewards for this pair are currently being processed. Funding may take up to a week after the round ends.',
    lastUpdated: 'Last updated at {date}',
    roundIsLive:
      '{round1} is now live! Check out the new markets added to this round! To claim your rewards from {round2} go to {myRewards} on the page.'
  }
}
