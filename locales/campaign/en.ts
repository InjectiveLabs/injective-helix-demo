import { I18nMessageFunction } from '@/types'

export default {
  campaign: {
    rank: 'Rank',
    claim: 'Claim',
    volume: 'Volume',
    overall: 'Overall',
    address: 'Address',
    endTime: 'End Time',
    estRewards: 'Est. Rewards',
    rewardStats: 'Reward Stats',
    totalRewards: 'Total Rewards',
    campaignNotFound: 'Campaign not found, please try again later.',
    title: 'LP Rewards',
    description: 'Get rewarded for providing liquidity',
    eligibleMarkets: 'Eligible Market for Rewards ',
    lastUpdated: ({ named }: I18nMessageFunction) =>
      `Last updated at ${named('date')}`
  }
}
