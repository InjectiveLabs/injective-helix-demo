import { LiquidityTableColumn, LiquidityDashboardTableColumn } from '@/types'

export default {
  lpRewards: {
    volume: 'Volume',
    overall: 'Overall',
    address: 'Address',
    rewards: 'Rewards',
    ongoing: 'Ongoing',
    title: 'LP Rewards',
    letsGo: "Let's go!",
    round: 'Round {round}',
    myRewards: 'My Rewards',
    allRewards: 'All Rewards',
    estRewards: 'Est. Rewards',
    totalVolume: 'Total Volume',
    rewardStats: 'Reward Stats',
    addLiquidity: 'Add Liquidity',
    rewardsRound: 'Rewards/Round',
    campaignRules: 'Campaign Rules',
    rewardsDetails: 'Rewards Details',
    rewardsToClaim: 'Rewards To Claim',
    volumeThisRound: 'Volume This Round',
    lastUpdated: 'Last updated at {date}',
    dashboardTitle: 'LP Rewards Dashboard',
    myRewardsCount: 'My Rewards ({rewards})',
    noActiveCampaigns: 'No active campaigns',
    endTimeForRound: 'End Time for Round {round}',
    totalRewardsAllTime: 'Total Rewards (All Time)',
    totalRewardsThisRound: 'Total Rewards This Round',
    totalRewardsOfRound: 'Total Rewards of Round {round}',
    helixLpRewardsRound: 'Helix LP Rewards Round {round}',
    description: 'Earn rewards by trading different spot markets',
    rewardsPending:
      'LP Rewards Pending: Rewards for this pair are currently being processed. Funding may take up to a week after the round ends.',
    legacyBotWarning:
      "Warning: You're missing out on LP rewards! Stop your legacy market strategy and create a new one on the new market to start earning.",
    roundIsLive:
      '{round1} is now live! Check out the new markets added to this round! To claim your rewards from {round2} go to {myRewards} on the page.',

    table: {
      liquidity: {
        [LiquidityTableColumn.Market]: 'Market',
        [LiquidityTableColumn.Volume]: 'Volume',
        [LiquidityTableColumn.Rewards]: 'Rewards',
        [LiquidityTableColumn.ActiveBots]: 'Active Bots'
      },
      dashboard: {
        [LiquidityDashboardTableColumn.Market]: 'Market',
        [LiquidityDashboardTableColumn.Volume]: 'Volume',
        [LiquidityDashboardTableColumn.Rewards]: 'Rewards',
        [LiquidityDashboardTableColumn.EstRewards]: 'Est. Rewards'
      }
    }
  }
}
