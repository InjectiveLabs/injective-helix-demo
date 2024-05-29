import { I18nMessageFunction } from '@/types'

export default {
  leaderboard: {
    title: 'Leaderboard',
    description: 'Top 100 weekly traders by PnL',
    tabs: {
      overall: 'Overall',
      volume: 'Volume',
      roi: 'ROI',
      pnl: 'PNL',
      summerTradingCompetition: 'Summer Trading competition'
    },
    lastUpdatedAt: ({ named }: I18nMessageFunction) =>
      `Last updated at ${named('timestamp')}`,
    resolution: 'Time interval',
    resolutionOptions: {
      daily: 'Daily',
      weekly: 'Weekly'
    },
    rank: 'Rank',
    address: 'Address',
    weeklyROI: 'Weekly ROI',
    weeklyPnL: 'Weekly Trading PnL',
    volume: 'Volume (USD)',
    volumePercentage: '% Volume',
    emptyHeader: 'No rankings found',
    emptyDescription: 'No rankings found',
    viewOnExplorer: 'View on Explorer',
    tooltip:
      'This profit and loss leaderboard reflects the approximate realized profit and loss from positions opened and closed on Helix since May 29, 2024. The leaderboard is purely for illustrative purposes and should not be used for any tax reporting obligations.'
  }
}
