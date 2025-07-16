export default {
  tradingBots: {
    all: 'All',
    time: 'Time',
    user: 'User',
    auto: 'Auto',
    lower: 'Lower',
    upper: 'Upper',
    active: 'Active',
    manual: 'Manual',
    endBot: 'End Bot',
    removed: 'Removed',
    pending: 'Pending',
    overview: 'Overview',
    showcase: 'Showcase',
    duration: 'Duration',
    spotGrid: 'Spot Grid',
    totalTvl: 'Total TVL',
    totalPnl: 'Total PnL',
    totalRoi: 'Total ROI',
    moreInfo: 'More Info',
    gridMode: 'Grid Mode',
    title: 'Trade Smarter',
    available: 'Available',
    geometric: 'Geometric',
    startTime: 'Start Time',
    gridBound: 'Grid Bound',
    investment: 'Investment',
    priceRange: 'Price Range',
    activeBots: 'Active Bots',
    lowerPrice: 'Lower Price',
    upperPrice: 'Upper Price',
    lowerBound: 'Lower Bound',
    upperBound: 'Upper Bound',
    gridNumber: 'Grid Number',
    stopReason: 'Stop Reason',
    futuresGrid: 'Futures Grid',
    totalProfit: 'Total Profit',
    volumeBoost: 'Volume Boost',
    totalAmount: 'Total Amount',
    totalAssets: 'Total Assets',
    viewDetails: 'View Details',
    profitGrid: 'Grid Interval',
    gridDetails: 'Grid Details',
    assetsInBot: 'Assets In Bot',
    currentPrice: 'Current Price',
    copyStrategy: 'Copy Strategy',
    noActiveBots: 'No Active Bots',
    enableLpMode: 'Enable LP Mode',
    trailingBound: 'Trailing Bound',
    setUpNewBot: 'Set up a new Bot',
    liquidityGrid: 'Liquidity Grid',
    topPerformers: 'Top Performers',
    initialAmount: 'Initial Amount',
    numberOfGrids: 'Number Of Grids',
    createStrategy: 'Create Strategy',
    enableTrailing: 'Enable Trailing',
    learnMoreHere: 'Learn more here.',
    removeStrategy: 'Remove Strategy',
    lowerPriceStop: 'Lower Price Stop',
    upperPriceStop: 'Upper Price Stop',
    saveOnFees: 'Adjust Deposit Amounts',
    noStrategies: 'No Strategies found.',
    optimizedAmounts: 'Optimized Amounts',
    totalBotsCreated: 'Total Bots Created',
    replicateStrategy: 'Replicate Strategy',
    buySymbolOnStop: 'Buy {symbol} on stop',
    insufficientFunds: 'Insufficient Funds',
    approximateProfit: 'Approximate Profit',
    initialEntryPrice: 'Initial Entry Price',
    trailingPriceRange: 'Trailing Price Range',
    createYourStrategy: 'Create Your Strategy',
    noActiveStrategies: 'No Active Strategies',
    keepOriginalAmounts: 'Keep Original Amounts',
    useFeeOptimizedAmounts: 'Use Suggested Amounts',
    sellAllSymbolOnStop: 'Sell all {symbol} on stop',
    exceededMaxRetries: 'Volatile Market Conditions',
    copyParametersToManual: 'Copy Parameters to Manual',
    botCreationConfirmation: 'Bot Creation Confirmation',
    strategyRemovalInitiated: 'Strategy Removal Initiated',
    sellSymbolUponTermination: 'Sell {symbol} upon termination',
    marketConditionsNotSupported: 'Market conditions not supported',
    minInvestmentDescription: "Min Investment: {symbols} ≥ {'$'}{amount}",

    youCanCloseThisNotification:
      'You can close this notification and continue using the platform.',
    confirmationDescription:
      'Please read the below information carefully before you confirm to proceed.',
    autoModeHeader:
      'These parameters are generated automatically based on the last 30 days trading prices.',
    nOfGridsTooltip:
      'Higher grid count places more orders, better capturing price movements but requiring more initial capital.',
    yourTradingStrategyIsBeingRemoved:
      'Your trading strategy is being removed and will be completed automatically. This process can take up to a few minutes.',
    disclaimer:
      'I have read and agreed to the Risk Disclaimer and understand that the parameter selection and investment decision will in all cases be made solely by the client.',
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
    },

    sgt: {
      lpModeTooltip:
        'When LP Mode is enabled, the strategy avoids rebalancing during setup and creates asymmetric buy and sell orders, replicating the behavior of a liquidity provider.',
      lowerPriceStopTooltip:
        'Define the price below which the grid will cease creating new buy orders. This isn’t a traditional ‘stop loss’ closing your position, but a condition to pause buying activity outside your desired grid range.',
      upperPriceStopTooltip:
        'Set the price above which the grid will cease creating new sell orders. This acts as a ceiling for active grid selling, pausing activity when the price exceeds your defined range.',
      minInvestmentTooltip:
        "Minimum Investment: Starts at {'$'}{amount}. Each grid beyond 10 adds $5, up to 100 grids. The amount is calculated in $ value of the {assets} assets.",
      balancedFeesMessage:
        'The value of your deposit is {initialInvestment} USD. Based on the price range and number of grids provided, the suggested amount for each asset is {quoteAmount} {quote} and {baseAmount} {base}. The suggested deposit amounts are based on the buy and sell orders the bot is going to create initially, while maintaining the same value as the original deposit amounts you provided.',
      investmentTooltip:
        "Reduce balancing strategy fees with a USDT & INJ mix. This isn't a new platform fee, but a way to cut gas costs when converting between quote and base denoms when creating the strategy.",
      gridModeTooltip:
        'In arithmetic mode, the price between two consecutive grids has a constant difference. In geometric mode, the price between two consecutive grids has a constant ratio.',

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

    liquidityBots: {
      title: 'Volume Boost Bot',
      description:
        'Boost trading volume effortlessly. Volume Boost Bot automates liquidity provision, executing trades within your specified range to capture opportunities and maintain market presence.',
      deposit: 'Deposit',
      passive: 'Passive',
      moderate: 'Moderate',
      duration: 'Duration',
      createBot: 'Create Bot',
      aggressive: 'Aggressive',
      selectPair: 'Select Pair',
      timeCreated: 'Time Created',
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
}
