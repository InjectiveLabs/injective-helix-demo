import { I18nMessageFunction } from '@/types'

export default {
  sgt: {
    pnl: 'PnL',
    time: 'Time',
    grids: 'Grids',
    market: 'Market',
    running: 'Running',
    confirm: 'Confirm',
    success: 'Success',
    history: 'history',
    duration: 'Duration',
    gridMode: 'Grid Mode',
    available: 'Available',
    setValues: 'Set Values',
    investment: 'Investment',
    create: 'Create Strategy',
    lowerPrice: 'Lower Price',
    upperPrice: 'Upper Price',
    lowerBound: 'Lower Bound',
    upperBound: 'Upper Bound',
    arithmetic: 'Arithmetic',
    priceRange: 'Price Range',
    gridNumber: 'Grid Number',
    profitGrid: 'Profit/grid',
    inProgress: 'In Progress',
    totalProfit: 'Total Profit',
    tradeAmount: 'Trade Amount',
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
    removeStrategy: 'Remove Strategy',
    strategyRemoved: 'Strategy Removed!',
    investmentAmount: 'Investment Amount',
    orderDetails: 'Order Details',
    connectWallet: 'Connect wallet to start grid trading',
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
    minimizeOneTimeFees:
      'Minimize one time strategy balancing fees by investing:',
    pleaseReadTheBelowInformationCarefullyBeforeYouConfirmToProceed:
      'Please read the below information carefully before you confirm to proceed.',
    termsAndConditions:
      'I have read and agreed to the Risk Disclaimer and understand that the parameter selection and investment decision will in all cases be made solely by the client.',
    amountsMayBeLessTooltip:
      'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.',
    yourStrategyIsOnTheMove: `Your strategy is on the move! Find all the details under the chart at the bottom right corner. If you're on a smaller screen, a quick scroll down might be needed to see everything.`
  }
}
