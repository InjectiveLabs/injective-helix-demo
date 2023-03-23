import { I18nMessageFunction } from '@/types'

export default {
  leaderboard: {
    title: 'Helix Trading Leaderboard',
    description: 'Highest accumulated trading volume',
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
    volume: 'Volume',
    volumePercentage: '% Volume',
    emptyHeader: 'No rankings found',
    emptyDescription: 'No rankings found',
    viewOnExplorer: 'View on Explorer'
  }
}
