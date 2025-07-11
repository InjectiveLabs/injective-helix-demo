export default {
  sgt: {
    pnl: 'PnL',
    time: 'Time',
    user: 'User',
    auto: 'Auto',
    close: 'Close',
    lower: 'Lower',
    upper: 'Upper',
    active: 'Active',
    amount: 'Amount',
    market: 'Market',
    manual: 'Manual',
    cancel: 'Cancel',
    endBot: 'End Bot',
    removed: 'Removed',
    pending: 'Pending',
    details: 'Details',
    confirm: 'Confirm',
    disabled: 'Disabled',
    duration: 'Duration',
    moreInfo: 'More Info',
    stopLoss: 'Stop Loss',
    gridMode: 'Grid Mode',
    available: 'Available',
    geometric: 'Geometric',
    startTime: 'Start Time',
    learnMore: 'Learn More',
    investment: 'Investment',
    lowerPrice: 'Lower Price',
    upperPrice: 'Upper Price',
    create: 'Create Strategy',
    lowerBound: 'Lower Bound',
    upperBound: 'Upper Bound',
    priceRange: 'Price Range',
    gridNumber: 'Grid Number',
    takeProfit: 'Take Profit',
    stopReason: 'Stop Reason',
    viewDetails: 'View Details',
    profitGrid: 'Grid Interval',
    totalProfit: 'Total Profit',
    gridDetails: 'Grid Details',
    totalAmount: 'Total Amount',
    enableLpMode: 'Enable LP Mode',
    initialAmount: 'Initial Amount',
    numberOfGrids: 'Number Of Grids',
    enableTrailing: 'Enable Trailing',
    learnMoreHere: 'Learn more here.',
    removeStrategy: 'Remove Strategy',
    lowerPriceStop: 'Lower Price Stop',
    upperPriceStop: 'Upper Price Stop',
    saveOnFees: 'Adjust Deposit Amounts',
    noStrategies: 'No Strategies found.',
    optimizedAmounts: 'Optimized Amounts',
    replicateStrategy: 'Replicate Strategy',
    buySymbolOnStop: 'Buy {symbol} on stop',
    insufficientFunds: 'Insufficient Funds',
    approximateProfit: 'Approximate Profit',
    initialEntryPrice: 'Initial Entry Price',
    trailingPriceRange: 'Trailing Price Range',
    noActiveStrategies: 'No Active Strategies',
    keepOriginalAmounts: 'Keep Original Amounts',
    useFeeOptimizedAmounts: 'Use Suggested Amounts',
    sellAllSymbolOnStop: 'Sell all {symbol} on stop',
    exceededMaxRetries: 'Volatile Market Conditions',
    copyParametersToManual: 'Copy Parameters to Manual',
    strategyRemovalInitiated: 'Strategy Removal Initiated',
    sellSymbolUponTermination: 'Sell {symbol} upon termination',
    marketConditionsNotSupported: 'Market conditions not supported',
    minInvestmentDescription: "Min Investment: {symbols} ≥ {'$'}{amount}",
    lpModeTooltip:
      'When LP Mode is enabled, the strategy avoids rebalancing during setup and creates asymmetric buy and sell orders, replicating the behavior of a liquidity provider.',
    lowerPriceStopTooltip:
      'Define the price below which the grid will cease creating new buy orders. This isn’t a traditional ‘stop loss’ closing your position, but a condition to pause buying activity outside your desired grid range.',
    upperPriceStopTooltip:
      'Set the price above which the grid will cease creating new sell orders. This acts as a ceiling for active grid selling, pausing activity when the price exceeds your defined range.',
    minInvestmentTooltip:
      "Minimum Investment: Starts at {'$'}{amount}. Each grid beyond 10 adds $5, up to 100 grids. The amount is calculated in $ value of the {assets} assets.",
    legacyBotWarning:
      "Warning: You're missing out on LP rewards! Stop your legacy market strategy and create a new one on the new market to start earning.",
    autoModeHeader:
      'These parameters are generated automatically based on the last 30 days trading prices.',
    nOfGridsTooltip:
      'Higher grid count places more orders, better capturing price movements but requiring more initial capital.',
    balancedFeesMessage:
      'The value of your deposit is {initialInvestment} USD. Based on the price range and number of grids provided, the suggested amount for each asset is {quoteAmount} {quote} and {baseAmount} {base}. The suggested deposit amounts are based on the buy and sell orders the bot is going to create initially, while maintaining the same value as the original deposit amounts you provided.',
    investmentTooltip:
      "Reduce balancing strategy fees with a USDT & INJ mix. This isn't a new platform fee, but a way to cut gas costs when converting between quote and base denoms when creating the strategy.",
    gridModeTooltip:
      'In arithmetic mode, the price between two consecutive grids has a constant difference. In geometric mode, the price between two consecutive grids has a constant ratio.',
    accountEndBot:
      'To transfer funds to your main account, please stop your current Spot Grid Trading Bot. This action will automatically initiate the transfer of your funds.',
    youCanCloseThisNotification:
      'You can close this notification and continue using the platform.',
    yourTradingStrategyIsBeingRemoved:
      'Your trading strategy is being removed and will be completed automatically. This process can take up to a few minutes.',
    confirmationDescription:
      'Please read the below information carefully before you confirm to proceed.',
    disclaimer:
      'I have read and agreed to the Risk Disclaimer and understand that the parameter selection and investment decision will in all cases be made solely by the client.',

    tabs: {
      liveSpotGrid: 'Live Spot Grid',
      spotGridHistory: 'Spot Grid History',
      liveFuturesGrid: 'Live Futures Grid',
      futuresGridHistory: 'Futures Grid History'
    },

    modes: {
      perpetual: 'Perpetual',
      geometric: 'Geometric',
      arithmetic: 'Arithmetic',
      arithmetic_lp: 'Arithmetic LP',
      trailing_arithmetic: 'Trailing Arithmetic',
      trailing_arithmetic_lp: 'Trailing Arithmetic LP'
    },

    optimization: {
      optimizeBalance: 'Optimize Balance',
      balanceOptimized: 'Optimal Balance',
      balanceStability: 'Balance Stability',
      confirmAndAdjust: 'Confirm and Adjust',
      balanceNeedsAdjusting: 'Balance Needs Adjusting',
      optimizeBalanceTitle: 'Optimize Strategy Balance',
      adjustYourAvailableBalance:
        'Adjust your available [{base}] and [{quote}] balance',
      yourBalanceIsOptimal:
        'Well-balanced for maximum grid efficiency within price range',
      yourBalanceIsOffBy:
        'Your balance is off by {percentage}% from the optimal 50/50 ratio.',
      balancedTooltip:
        'Balance Stability indicates how well your liquidity position maintains its intended ratio between tokens. A higher percentage means your position is more resistant to market volatility and requires less frequent rebalancing.',
      optimizeBalanceBody:
        'To reduce trading fees and improve operational efficiency, we suggest rebalancing your assets. This technical adjustment optimizes how your strategy executes trades, but is not financial advice on asset selection or expected returns.'
    }
  },

  tradingBots: {
    all: 'All',
    overview: 'Overview',
    showcase: 'Showcase',
    spotGrid: 'Spot Grid',
    totalTvl: 'Total TVL',
    totalPnl: 'Total PnL',
    totalRoi: 'Total ROI',
    title: 'Trade Smarter',
    priceRange: 'Price Range',
    activeBots: 'Active Bots',
    futuresGrid: 'Futures Grid',
    volumeBoost: 'Volume Boost',
    totalAssets: 'Total Assets',
    assetsInBot: 'Assets In Bot',
    copyStrategy: 'Copy Strategy',
    noActiveBots: 'No Active Bots',
    setUpNewBot: 'Set up a new Bot',
    liquidityGrid: 'Liquidity Grid',
    topPerformers: 'Top Performers',
    totalBotsCreated: 'Total Bots Created',
    trailingPriceRange: 'Trailing Price Range',
    createYourStrategy: 'Create Your Strategy',
    botCreationConfirmation: 'Bot Creation Confirmation',
    description:
      'Your command center for automated trading on Helix. Monitor your active bots, track your LP rewards, and discover high-performing community strategies to inform your next move.',
    topPerformersDescription:
      'Learn from real-time success. See which strategies and parameters are currently yielding the best results on Helix. Use this data to refine your approach or launch a new bot based on proven performance.',

    botType: {
      spotGrid: 'Spot Grid',
      futuresGrid: 'Futures Grid',
      liquidityGrid: 'Volume Boost'
    },

    myLpRewards: {
      viewAll: 'View All',
      title: 'My LP Rewards',
      volumeAllTime: 'Total Volume',
      rewardsAllTime: 'Total LP Rewards',
      volumeThisRound: 'Volume This Round',
      totalEstRewards: 'Total Est. Rewards',
      roundEndTime: 'End Time For Round {round}'
    }
  },

  liquidityBots: {
    title: 'Volume Boost Bot',
    description:
      'Boost trading volume effortlessly. Volume Boost Bot automates liquidity provision, executing trades within your specified range to capture opportunities and maintain market presence.',
    deposit: 'Deposit',
    passive: 'Passive',
    moderate: 'Moderate',
    duration: 'Duration',
    stopLoss: 'Stop Loss',
    createBot: 'Create Bot',
    aggressive: 'Aggressive',
    selectPair: 'Select Pair',
    takeProfit: 'Take Profit',
    timeCreated: 'Time Created',
    totalAmount: 'Total Amount',
    totalProfit: 'Total Profit',
    currentPrice: 'Current Price',
    finalBalance: 'Final Balance',
    depositAmount: 'Deposit Amount',
    trailingUpper: 'Trailing Upper',
    trailingLower: 'Trailing Lower',
    currentBalance: 'Current Balance',
    setLiquidityBot: 'Set Up a Liquidity Bot',
    volatilityStrategy: 'Volatility Strategy',
    trailingBoundaries: 'Trailing Boundaries',
    upToRewards: 'Up to {amount} {symbol} weekly rewards',
    depositDescription: 'You can add liquidity with a single asset'
  }
}
