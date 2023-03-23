import { I18nMessageFunction } from '@/types'

export default {
  home: {
    title: 'The Premier Decentralized Crypto Exchange',
    subtitle:
      'Trade unlimited cross-chain crypto assets and perpetual markets with market leading rebates*',
    tradeNow: 'Trade Now',
    latestNews: 'Latest News',
    viewAllMarkets: 'View all markets',
    trending: 'Trending',
    newlyAdded: 'Newly added',
    totalTradingVolume: 'Total trading volume',
    totalTrades: 'Total trades',
    sevenDaysPrice: '7 days price',
    newToCrypto: 'New to Crypto',
    experienceTrader: 'An Experienced Trader',
    institutionalTrader: 'An Institutional Trader',
    builtOn: 'Built on',
    startTradingNote: 'Start Trading on Helix Now',
    whyTradeOnHelix: 'Why Trade on Helix',
    decentralizedWithAdvancedTypeOrders:
      'Decentralized exchange with advanced order types',
    enjoySpotTrading:
      'Enjoy trading spot and perpetual markets on the premier front-running resistant decentralized orderbook exchange using stop-loss and take-profit orders.',
    lowFees: 'Minimal fees for maximum benefits and rewards',
    zeroGasFees:
      'Zero gas fees, low taker fees and highly competitive maker fee rebates for the best trading experience amongst all exchanges.',
    crossChainAssets: 'Cross-chain assets and novel markets',
    seamlesslyTransferAssets:
      'Seamlessly transfer assets from Ethereum and Cosmos networks to trade popular markets as well as unique markets not available elsewhere.',
    getStarted: 'Get Started in 3 Simple Steps',
    howToBridge: 'Transfer assets to begin',
    injective: 'INJECTIVE',
    howToPurchaseTokens: 'Trade spot markets',
    howToPlaceStopOrders: 'Trade perpetuals with advanced orders',
    startTradingNow: 'Start trading now',
    fast: 'Fast',
    interoperable: 'Interoperable',
    gasFree: 'Gas Free',
    secure: 'Secure',
    market: 'Market',
    lastPrice: 'Last price',
    change24h: 'Change (24H)'
  },

  newsletter: {
    title: 'Subscribe to Helix newsletter',
    emailAddress: 'Email address',
    subscribe: 'Subscribe',
    disclaimer: 'Disclaimer',
    privacyPolicy: 'Privacy Policy',
    termsAndCondition: 'Terms and Conditions',
    subscribeToast: "You've successfully subscribed to our newsletter!",
    disclaimerMessage: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'By subscribing, you agree to the ',
        named('termsAndCondition'),
        ' have read the ',
        named('privacyPolicy'),
        ' and acknowledge that you have read and understand the ',
        named('disclaimer'),
        '.'
      ])
  },

  footer: {
    resources: 'Resources',
    analytics: 'Analytics',
    termsAndConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    support: 'Support',
    faq: 'FAQ',
    submitRequest: 'Submit A Request',
    feeDiscounts: 'Fee Discounts',
    apiDocumentation: 'API Documentation',
    community: 'Community',
    helixProvides:
      '*Note: Helix is able to provide maker rebates across a number of markets as approved via the Injective DAO.'
  }
}
