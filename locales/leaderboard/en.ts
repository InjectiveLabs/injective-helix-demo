import { I18nMessageFunction } from '@/types'

export default {
  leaderboard: {
    title: 'Leaderboard',
    description: 'Weekly top 100 traders with the highest trading PnL',
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
    viewOnExplorer: 'View on Explorer'
  }
}
