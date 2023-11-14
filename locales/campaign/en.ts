import { I18nMessageFunction } from '@/types'

export default {
  campaign: {
    rank: 'Rank',
    claim: 'Claim',
    volume: 'Volume',
    success: 'Success',
    overall: 'Overall',
    address: 'Address',
    rewards: 'Rewards',
    endTime: 'End Time',
    estRewards: 'Est. Rewards',
    rewardStats: 'Reward Stats',
    totalRewards: 'Total Rewards',
    campaignRules: 'Campaign Rules',
    succesfulyClaimedRewards: 'Succesfuly Claimed Rewards',
    readyIn: 'Ready in {hours} Hrs',
    campaignNotFound: 'Campaign not found, please try again later.',
    title: 'LP Rewards',
    description: 'View and claim your LP Rewards',
    eligibleMarkets: 'Eligible Market for Rewards ',
    lastUpdated: ({ named }: I18nMessageFunction) =>
      `Last updated at ${named('date')}`
  }
}
