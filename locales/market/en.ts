import { I18nMessageFunction } from '@/types'

export default {
  markets: {
    title: 'Markets',
    vol: 'Vol',
    quote: 'Quote',
    market: 'Market',
    category: 'Category',
    whatsNew: "What's new",
    topGainer: 'Top Gainer',
    topVolume: 'Top Volume',
    poweredBy: 'Powered by',
    settledAt: 'Settled at',
    perpetuals: 'Perpetuals',
    showLowVol: 'Show low Vol.',
    change24h: 'Change (24h)',
    volume24h: 'Volume (24h)',
    hotMarkets: 'Hot Markets',
    newMarkets: 'New Markets',
    topGainers: 'Top Gainers',
    permisionlessWarning:
      'Anyone can create a permissionless market on Helix. Participants are advised to conduct their own research before trading.',
    emptyHeader: 'No markets found',
    preLaunchFutures: 'Pre Launch Futures',
    expiredOrSettledRecently: 'Recently Expired/Settled',
    emptyHeaderFavorites: 'No favorited markets yet.',
    emptyDescription:
      'No results found. Search for markets available on Injective outside of Helix.',
    emptyDescriptionFavorites: 'Your starred markets will be shown here.',
    inactive: 'Inactive',
    themes: {
      memes: 'Memes',
      l1l2: 'L1/L2',
      infrastructure: 'Infrastructure',
      'defi-dex': 'DeFi/DEX',
      nft: 'NFT/Gaming',
      'liquid-staking': 'Liquid Staking',
      stablecoins: 'Stablecoins'
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
    availableBalance: ({ named }: I18nMessageFunction) =>
      `Available ${named('asset')}`,
    transferToTrade: 'Transfer to trade',
    wallet: 'Wallet'
  }
}
