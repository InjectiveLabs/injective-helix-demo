import { I18nMessageFunction } from '@/types'

export default {
  sgt: {
    pnl: 'PnL',
    time: 'Time',
    next: 'Next',
    skip: 'Skip',
    grids: 'Grids',
    close: 'Close',
    market: 'Market',
    endBot: 'End Bot',
    running: 'Running',
    confirm: 'Confirm',
    success: 'Success',
    history: 'history',
    lowerPrice: 'Lower',
    upperPrice: 'Upper',
    duration: 'Duration',
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
    inProgress: 'In Progress',
    profitGrid: 'Grid Interval',
    totalProfit: 'Total Profit',
    tradeAmount: 'Trade Amount',
    gridDetails: 'Grid Details',
    keepQuote: 'Keep USDT Only',
    timeCreated: 'Time Created',
    orderDetails: 'Order Details',
    numberOfGrids: 'Number Of Grids',
    removeStrategy: 'Remove Strategy',
    strategyRemoved: 'Strategy Removed!',
    investmentAmount: 'Investment Amount',
    initialEntryPrice: 'Initial Entry Price',
    changeToQuoteAndBase: 'Change to USDT + INJ',
    totalInvestmentAmount: 'Total Investment Amount',
    totalInvestmentCurrency: 'Total Investment Currency',
    connectWallet: 'Connect wallet to start grid trading',
    includeDenom: 'Include [INJ] in your initial investment',
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
    createYourGridTradingStrategy: 'Create your grid trading strategy',
    gridStrategyCreatedSuccessfully: 'Grid Strategy Created Successfully!',
    gridOrderConfirmation: 'Grid Order Confirmation',
    investmentAmountTooltip:
      'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.',
    initialEntryTooltip:
      'The initial entry price is the price at which the smart contract places the first order, setting the baseline for rebalancing your INJ and USDT portfolio to kickstart the strategy.',
    balancedFeesMessage:
      'You will be saving balancing fees if you invest in both INJ and USDT. This is due to we will have to convert some of the USDT to INJ to start the strategy. Learn more here.',
    gridIntervalTooltip:
      'Specifies the constant price gaps between grid levels within your set upper and lower price range.',
    minimizeOneTimeFees:
      'Minimize one time strategy balancing fees by investing:',
    pleaseReadTheBelowInformationCarefullyBeforeYouConfirmToProceed:
      'Please read the below information carefully before you confirm to proceed.',
    termsAndConditions:
      'I have read and agreed to the Risk Disclaimer and understand that the parameter selection and investment decision will in all cases be made solely by the client.',
    amountsMayBeLessTooltip:
      'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.',
    yourStrategyIsOnTheMove: `Your strategy is on the move! Find all the details under the chart at the bottom right corner. If you're on a smaller screen, a quick scroll down might be needed to see everything.`,
    investmentTooltip:
      "Reduce balancing strategy fees with a USDT & INJ mix. This isn't a new platform fee, but a way to cut gas costs when converting between quote and base denoms when creating the strategy.",
    bannerTitle: 'Get Started on Spot Grid Trading.',
    spotGridTradingBot: 'Spot grid trading bot ',
    automatesBuyingAndSelling: 'automates buying and selling on spot trading.',
    splitSentence: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate([named('first'), named('second')]),
    setUpABot: 'Set up a bot',
    runABot: 'Run a bot',
    endABot: 'End a bot',
    step1text1:
      ' determines the price at which the bot will place buy and sell orders.',
    step1text2: ' in the price range, defining the profit per grid.',
    step1text3:
      ' is the amount of capital that the bot will use to run the strategy',
    step2text1:
      'When the price falls, the bot buys and sets a higher sell point.',
    step2text2: 'When the price rises, it sells and sets a lower buy point.',
    step2text3: ' to check how the bot is placing them for you.',
    step2text4: ({ named, interpolate }: I18nMessageFunction) =>
      interpolate(['Check the ', named('faq'), ' for more info.']),
    step3text1: 'All open orders will be canceled.',
    step3text2: 'Your money will be transferred. back to your main account.',
    step3text3:
      "Review the performance of your past strategies in the 'Grid Trading History' tab."
  }
}
