import { MarketCategoryType } from '@/types'

export default {
  markets: {
    vol: 'Vol',
    quote: 'Quote',
    title: 'Markets',
    cancel: 'Cancel',
    iAsset: 'iAsset',
    market: 'Market',
    inactive: 'Inactive',
    category: 'Category',
    marketId: 'Market ID',
    whatsNew: "What's new",
    topGainer: 'Top Gainer',
    topVolume: 'Top Volume',
    poweredBy: 'Powered by',
    settledAt: 'Settled at',
    perpetuals: 'Perpetuals',
    showLowVol: 'Show low vol.',
    change24h: 'Change (24h)',
    volume24h: 'Volume (24h)',
    hotMarkets: 'Hot Markets',
    newMarkets: '🐤 New Markets',
    topGainers: '🚀 Top Gainers',
    unverified: 'Unverified',
    emptyHeader: 'No markets found',
    proceedAnyway: 'Proceed Anyway',
    preLaunchFutures: 'Pre Launch Futures',
    emptyHeaderFavorites: 'No favorited markets yet.',
    expiredOrSettledRecently: 'Recently Expired/Settled',
    closePositionWarningTitle: 'High price impact detected',
    emptyDescriptionFavorites: 'Your starred markets will be shown here.',
    permisionlessWarning:
      'Anyone can create a permissionless market on Helix. Participants are advised to conduct their own research before trading.',
    emptyDescription:
      'No results found. Search for markets available on Injective outside of Helix.',
    closePositionWarningDescription:
      'Closing this open position with a market order may result in an unfavorable execution price. You may want to consider closing with a limit order instead.',
    themes: {
      memes: 'Memes',
      l1l2: 'L1/L2',
      infrastructure: 'Infrastructure',
      'defi-dex': 'DeFi/DEX',
      nft: 'NFT/Gaming',
      'liquid-staking': 'Liquid Staking',
      stablecoins: 'Stablecoins'
    },
    '2024ElectionTooltip':
      'This market follows the Polymarket 2024 Presidential Election market price feed, with TRUMPWIN as the underlying asset. For more details, visit the {docs}.',
    buidlTooltip:
      'This product is an Index Perp. For more information, please refer to the {docs}.',
    indexMarketTooltip:
      'This market follows the {label}. More details can be found {link}.',
    filters: {
      [MarketCategoryType.All]: 'All',
      [MarketCategoryType.Favorites]: 'Favorites',
      [MarketCategoryType.Perps]: 'Perps',
      [MarketCategoryType.Spot]: 'Spot',
      [MarketCategoryType.Trending]: 'Trending',
      [MarketCategoryType.Injective]: 'Injective',
      [MarketCategoryType.Layer1]: 'L1',
      [MarketCategoryType.Layer2]: 'L2',
      [MarketCategoryType.Experimental]: 'Experimental',
      [MarketCategoryType.DeFi]: 'DeFi',
      [MarketCategoryType.AI]: 'AI',
      [MarketCategoryType.Meme]: 'Meme',
      [MarketCategoryType.RWA]: 'RWA',
      [MarketCategoryType.iAssets]: 'iAssets'
    }
  },

  marketPage: {
    assets: 'Assets',
    assetsFrom: 'Assets From',
    asseuitsNote: '',
    balances: 'Balances',
    portfolio: 'Portfolio',
    account: 'Account',
    noTradingBalance: 'Deposit to start trading!',
    noChainBalance: 'We cannot find any token balances for your address.',
    noChainBalanceNote: 'Use Injective Bridge to transfer assets to Injective.',
    noTradingAccountBalance:
      'Transfer to your Injective Trading Account to start trading on Helix.',
    startTrading: 'Start Trading!',
    availableBalance: 'Available {asset}',
    transferToTrade: 'Transfer to trade',
    wallet: 'Wallet'
  }
}
