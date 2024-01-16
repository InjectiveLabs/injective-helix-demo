import { I18nMessageFunction } from '@/types'

export default {
  sgt: {
    pnl: 'PnL',
    time: 'Time',
    skip: 'Skip',
    user: 'User',
    auto: 'Auto',
    grids: 'Grids',
    close: 'Close',
    amount: 'Amount',
    market: 'Market',
    endBot: 'End Bot',
    manual: 'Manual',
    running: 'Running',
    lower: 'Lower',
    upper: 'Upper',
    details: 'Details',
    confirm: 'Confirm',
    success: 'Success',
    history: 'history',
    enabled: 'Enabled',
    removed: 'Removed',
    lowerPrice: 'Lower Price',
    upperPrice: 'Upper Price',
    disabled: 'Disabled',
    duration: 'Duration',
    stopLoss: 'Stop Loss',
    gridMode: 'Grid Mode',
    available: 'Available',
    setValues: 'Set Values',
    investment: 'Investment',
    arithmetic: 'Arithmetic',
    create: 'Create Strategy',
    lowerBound: 'Lower Bound',
    upperBound: 'Upper Bound',
    priceRange: 'Price Range',
    gridNumber: 'Grid Number',
    viewOrders: 'View Orders',
    takeProfit: 'Take Profit',
    stopReason: 'Stop Reason',
    inProgress: 'In Progress',
    stopTrigger: 'Stop Trigger',
    profitGrid: 'Grid Interval',
    totalProfit: 'Total Profit',
    saveOnFees: 'Adjust Deposit Amounts',
    tradeAmount: 'Trade Amount',
    gridDetails: 'Grid Details',
    keepQuote: 'Keep {quote} Only',
    totalAmount: 'Total Amount',
    optimizedAmounts: 'Optimized Amounts',
    timeCreated: 'Time Created',
    learnMore: 'Learn More',
    currentPrice: 'Current Price',
    next: 'Next ({step}/{steps})',
    orderDetails: 'Order Details',
    initialAmount: 'Initial Amount',
    numberOfGrids: 'Number Of Grids',
    gettingStarted: 'Getting Started',
    learnMoreHere: 'Learn more here.',
    removeStrategy: 'Remove Strategy',
    finalBalance: 'Final Balance',
    currentBalance: 'Current Balance',
    minInvestment: 'Min investment: $ {amount}',
    totalInvestment: 'Total Investment',
    useFeeOptimizedAmounts: 'Use Suggested Amounts',
    keepOriginalAmounts: 'Keep Original Amounts',
    strategyRemoved: 'Strategy Removed!',
    totalBaseAndQuote: 'Total {base} + {quote} value: >= {amount} {quote}',
    investmentAmount: 'Investment Amount',
    advancedSettings: 'Advanced Settings',
    insufficientFunds: 'Insufficient Funds',
    exceededMaxRetries: 'Volatile Market Conditions',
    initialInvestment: 'Initial Investment',
    autoModeHeader:
      'These parameters are generated automatically based on the last 30 days trading prices.',
    stopLossTooltip:
      'The bot will stop when the last price of the pair reaches the set stop loss.',
    takeProfitTooltip:
      'The bot will stop when the last price of the pair reaches the set take profit.',
    initialInvestmentTooltip:
      'The {quoteSymbol} and {baseSymbol} amount used to start the strategy.',
    initialEntryPrice: 'Initial Entry Price',
    sellAllBaseOnStop: 'Sell all base on stop',

    noStrategiesFound: 'No Strategies Found',
    changeToQuoteAndBase: 'Change to {quote} + {base}',
    totalInvestmentAmount: 'Total Investment Amount',
    totalInvestmentCurrency: 'Total Investment Currency',
    sellAllBaseCoinsOnStop: 'Sell all base coins on Stop',
    totalAmountTooltip: 'Your current Spot Grid Trading Sub account net worth',
    currentBalanceTooltip:
      'The current amount of {quoteSymbol} and {baseSymbol} in you spot grid trading subaccount.',
    finalBalanceTooltip:
      'Represents the total amount of {quoteSymbol} and {baseSymbol} remaining before stopping the grid strategy',
    sellAllBaseOnStopTooltip:
      'Once enabled, the bot will automatically sell all {symbol} at market price when the grid is stopped.',
    nOfGridsTooltip:
      'The higher the number of grids means the more limit orders the bot will place on behalf of you. More limit orders increases the chances of capturing the price movements but also increases the minimum amount of initial capital required.',
    connectWallet: 'Connect wallet to start grid trading',
    includeDenom: 'Include [{symbol}] in your initial investment',
    createStrategyModalQuote: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([
        named('quoteAmount'),
        ' will be transferred from your main subaccount to your SGT ',
        named('marketSlug'),
        ' sub account.'
      ]),
    createStrategyModalBaseAndQuote: ({
      named,
      interpolate
    }: I18nMessageFunction) =>
      interpolate([
        named('quoteAmount'),
        ' and ',
        named('baseAmount'),
        ' will be transferred from your main subaccount to your SGT ',
        named('marketSlug'),
        ' sub account.'
      ]),
    aFewClicksBeforeTheStrategyIsCreated:
      'A few clicks before the strategy is created',
    thereAre2TransactionsRequiredToCreateAndEnableSpotGridTrading:
      'There are 2 transactions required to create and enable Spot Grid Trading.',
    letHelixSendsYouRequestForTransactions:
      'Let Helix sends you request for transactions',
    pleaseConfirmOnYourWallet: 'Please confirm on your wallet...',
    copyParametersToManual: 'Copy Parameters to Manual',
    createYourGridTradingStrategy: 'Create your grid trading strategy',
    gridStrategyCreatedSuccessfully: 'Grid Strategy Created Successfully!',
    gridOrderConfirmation: 'Grid Order Confirmation',
    investmentAmountTooltip:
      'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.',
    initialEntryTooltip:
      'The initial entry price is the price at which the smart contract places the first order, setting the baseline for rebalancing your INJ and USDT portfolio to kickstart the strategy.',
    balancedFeesMessage:
      'The value of your deposit is {initialInvestment} USD. Based on the price range and number of grids provided, the suggested amount for each asset is {quoteAmount} {quote} and {baseAmount} {base}. The suggested deposit amounts are based on the buy and sell orders the bot is going to create initially, while maintaining the same value as the original deposit amounts you provided.',
    gridIntervalTooltip:
      'Specifies the constant price gaps between grid levels within your set upper and lower price range.',
    minimizeOneTimeFees:
      'Minimize one time strategy balancing fees by investing:',
    pleaseReadTheBelowInformationCarefullyBeforeYouConfirmToProceed:
      'Please read the below information carefully before you confirm to proceed.',
    termsAndConditions:
      'I have read and agree to the Helix Terms and Conditions. I understand that my use of grid trading is solely at my own risk and that all decisions related to grid trading are solely my own.',
    amountsMayBeLessTooltip:
      'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.',
    yourStrategyIsOnTheMove: `Your strategy is on the move! Find all the details under the chart at the bottom right corner. If you're on a smaller screen, a quick scroll down might be needed to see everything.`,
    investmentTooltip:
      "Reduce balancing strategy fees with a USDT & INJ mix. This isn't a new platform fee, but a way to cut gas costs when converting between quote and base denoms when creating the strategy.",
    bannerTitle: 'Get started with Spot Grid Trading.',
    spotGridTradingBot: 'Spot grid trading bot ',
    automatesBuyingAndSelling:
      'Automate order placements to buy low, sell high.',
    splitSentence: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([named('first'), named('second')]),
    setUpABot: 'Set up a bot',
    runABot: 'Run a bot',
    endABot: 'End a bot',

    step1: {
      priceRange:
        ' represents the upper and lower price levels of the orders that will be placed.',
      grids: ' represents the number of limit orders the bot will place.',
      investment:
        ' is the amount of capital that the bot will use to run the strategy.'
    },

    step2: {
      priceFalls:
        'When the price falls and meet your buy order price level, your order will be filled and the bot will automatically place a sell order at a higher price.',
      priceRises:
        'When the price rises and meet your sell order price level, your order will be filled and the bot will automatically place a buy order at a lower price.',
      viewOrders:
        'You can check the open orders placed by the bot at any time.',
      faq: ({ named, interpolate }: I18nMessageFunction) =>
        interpolate(['Check the ', named('faq'), ' for more info.'])
    },

    step3: {
      openOrdersCancelled: 'All open orders will be canceled.',
      moneyTransferred:
        'Assets used by the bot will be transferred back to your main account.',
      review:
        "Review the performance of your past strategies in the 'Grid Trading History' tab."
    },

    advanced: {
      tpSl: 'TP/SL',
      enabled: 'Enabled',
      disabled: 'Disabled',
      settleIn: 'When the bot stops, settle in',
      sellAllOnStop: 'Sell all {symbol} on stop',
      buyOnStop: 'Buy {symbol} on stop',
      buyBaseOnStop: 'Buy {symbol} on stop',
      stopLossPrice: 'Stop Loss Price',
      takeProfitPrice: 'Take Profit Price'
    }
  }
}
