import { MarketCategoryType } from '@/types'

export default {
  markets: {
    vol: 'Vol',
    iAsset: 'iAsset',
    marketId: 'Market ID',
    showLowVol: 'Show low vol.',
    newMarkets: '🐤 New Markets',
    topGainers: '🚀 Top Gainers',
    closePositionWarningTitle: 'High price impact detected',
    indexMarketTooltip:
      'This market follows the {label}. More details can be found {link}.',
    buidlTooltip:
      'This product is an Index Perp. For more information, please refer to the {docs}.',
    closePositionWarningDescription:
      'Closing this open position with a market order may result in an unfavorable execution price. You may want to consider closing with a limit order instead.',
    '2024ElectionTooltip':
      'This market follows the Polymarket 2024 Presidential Election market price feed, with TRUMPWIN as the underlying asset. For more details, visit the {docs}.',
    filters: {
      [MarketCategoryType.All]: 'All',
      [MarketCategoryType.Favorites]: 'Favorites',
      [MarketCategoryType.Perps]: 'Perps',
      [MarketCategoryType.Spot]: 'Spot',
      [MarketCategoryType.Trending]: 'Trending',
      [MarketCategoryType.Injective]: 'Injective',
      [MarketCategoryType.Layer1]: 'L1',
      [MarketCategoryType.DeFi]: 'DeFi',
      [MarketCategoryType.AI]: 'AI',
      [MarketCategoryType.RWA]: 'RWA',
      [MarketCategoryType.iAssets]: 'iAssets'
    }
  }
}
