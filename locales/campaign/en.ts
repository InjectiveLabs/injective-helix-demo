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
    liquidityBotRewards: 'Liquidity Bot Rewards',
    eligibleMarkets: 'Eligible Market for Rewards ',
    getRewarded: 'Get rewarded whenever your bot trades',
    lastUpdated: ({ named }: I18nMessageFunction) =>
      `Last updated at ${named('date')}`
  }
}
