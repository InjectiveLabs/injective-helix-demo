import { I18nMessageFunction } from '@/types'

export default {
  home: {
    title: 'Open Finance Reimagined',
    openFinance: 'Open Finance',
    description:
      'Helix unlocks limitless financial possibilities for everyone. Take back control of your money and access any asset with unmatched liquidity on the only chain purpose built for finance.',
    reimagined: 'Reimagined',
    subtitle:
      'Explore limitless financial possibilities. Helix provides unmatched access to global financial primitives, endless on-chain gateways, and true institutional liquidity.',
    tradeNow: 'Trade Now',
    latestNews: 'Latest News',
    viewAllMarkets: 'View all markets',
    trending: 'Trending',
    totalMarkets: 'Total Markets',
    totalVolume: 'Total Volume',
    infiniteMarkets: 'Infinite Markets',
    mevResistant: 'MEV Resistant',
    getStartedHome: 'Get Started',
    infrastructure: 'The Premier On-Chain Exchange Infrastructure',
    builtForTheCommunity: 'Built for the Community',
    builtForTheCommunityDescription: 'No investors, no VCs, no nonsense.',
    unprecedentedAccessToGlobalMarkets:
      'Unprecedented Access to Global Markets',
    engage:
      'Engage with performant decentralized exchange primitives, tokenized assets, and sophisticated Web3 markets with a plug-and-play suite of products powering the future of finance.',
    unifiedLiquidity: 'Unified Liquidity',
    unifiedLiquidityDescription:
      'Helix uniquely aggregates unparalleled institutional grade liquidity, enabling anyone to leverage capital efficient financial markets on the world’s first fully decentralized orderbook network.',
    tailoredSolutionsForEveryNeed: 'Tailored Solutions for Every Need',
    utilizeBespoke:
      'Utilize bespoke on-chain gateways to seamlessly interact with leading financial institutions, tokenized assets and sophisticated structured products.',
    helixInstitutional: 'Helix Institutional',
    accessTheFuture: 'Access The Future of Open Finance',
    InstitutionalGateways: 'Institutional Gateways',
    newlyAdded: 'Newly added',
    markets: 'Markets',
    // openInterest: 'Open interest',
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
    startTrading: 'Start trading',
    depositCrypto: 'Deposit Crypto',
    fast: 'Fast',
    interoperable: 'Interoperable',
    gasFree: 'Gas Free',
    secure: 'Secure',
    market: 'Market',
    lastPrice: 'Last price',
    change24h: 'Change (24h)',
    tradingVolume: 'Trading volume',
    overviewTitle: 'Better and faster.\nExperience trading like never before.',
    overview: {
      faster: 'faster',
      title: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate(['Better and ', named('faster'), '.']),
      tradingBotsTitle: 'Trading Bots',
      tradingBotsDescription:
        'Trade smarter and leverage advanced strategies in just a click.',
      newAccountsTitle: 'Accounts Overview',
      newAccountsDescription:
        'View your open positions, trading history, and portfolio all in one convenient location.',
      pnlTitle: 'PnL Analysis',
      pnlDescription:
        'Evaluate and assess the financial performance of your portfolio.',
      gasFreeTitle: 'Gas Free Trading',
      gasFreeDescription:
        'Never worry about gas fees on Helix. Zero gas, always.',
      experienceTrading: 'Experience trading like never before.'
    },

    gettingStarted: {
      title: 'Getting started on Helix',
      injectiveBridge: 'Injective Bridge',
      description: 'Deposit crypto assets to Injective ',
      description2: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'Bridge USDT and other assets into Helix via the ',
          named('bridgeLink'),
          '.'
        ]),
      gasRequirement:
        'Make sure you get at least 0.1 INJ to pay for the transaction fee.',
      steps: 'Steps',
      step1: {
        title: 'Step 1',
        description: 'Visit the Injective Bridge and connect your wallet.'
      },
      step2: {
        title: 'Step 2',
        description:
          'Select the source chain (e.g. Ethereum, Cosmos or Solana).'
      },
      step3: {
        title: 'Step 3',
        description: 'Choose USDT or any other asset'
      },
      step4: {
        title: 'Step 4',
        description:
          'Once complete, return to Helix and check your Balances on the Portfolio page. You are ready to trade!'
      },
      cta: 'Go to Injective Bridge'
    }
  },

  newsletter: {
    title: 'Sign Up for Helix Notifications',
    emailAddress: 'Email address',
    subscribe: 'Subscribe',
    disclaimer: 'Disclaimer',
    privacyPolicy: 'Privacy Policy',
    termsAndCondition: 'Terms and Conditions',
    subscribeToast: "You've successfully signed up for Helix notifications!",
    disclaimerMessage: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'By subscribing, you agree to the ',
        named('termsAndCondition'),
        ' and have read the ',
        named('privacyPolicy'),
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
    lpRewards: 'LP Rewards',
    submitRequest: 'Submit A Request',
    institutional: 'Institutional',
    feeDiscounts: 'Fee Discounts',
    apiDocumentation: 'API Documentation',
    community: 'Community',
    helixProvides:
      'Note: Helix is able to provide maker rebates across a number of markets as approved via the Injective DAO.'
  }
}
