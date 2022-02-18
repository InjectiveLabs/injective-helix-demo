export default {
  activities: {
    activities: 'Activities',
    spotOrders: 'Spot Orders',
    derivativeOrders: 'Derivative Orders',
    rewardHistory: 'Reward History',
    fundingHistory: 'Funding History',
    openOrders: 'Open Orders',
    tradeHistory: 'Trade History',
    positions: 'Positions',
    ordersHistory: 'Orders History',
    openPositions: 'Open positions',
    cancelOrders: 'Cancel Orders',
    cancelOrdersSuccess: 'Your orders have been cancelled',
    closePositionsSuccess: 'Your positions have been closed',
    funds: 'Funds',

    emptyFundingPayments: 'No funding payments found'
  },

  trade: {
    all: 'All',
    timestamp: 'Time stamp',
    timestamp_tooltip:
      "The time at which the trade was executed (times are shown in your browser's timezone).",
    pair: 'Pair',
    type: 'Type',
    type_tooltip: 'The type of your order: limit or market.',
    side: 'Side',
    side_tooltip: 'The side of your trade: long or short',
    price: 'Price',
    amount: 'Amount',
    amount_tooltip:
      'The total value of the base asset at the time which the trade was executed (i.e. for BTC/USDT, BTC is the base asset and USDT is the quote asset).',
    filled: 'Filled',
    total: 'Total',
    total_tooltip:
      'The total value of the position which is determined by the mark price with the following formula: Mark Price * Base Asset Amount.',
    fee: 'Fee',
    fees_tooltip:
      'Trading fees associated with the trade. Trading fees on Injective can be lowered using rebates.',
    buy: 'Buy',
    sell: 'Sell',
    unfilled: 'Unfilled',
    filter: 'Filter by asset',
    cancelAllOrders: 'Cancel all orders',
    closeAllPositions: 'Close all positions',
    reduce_only: 'Reduce Only',
    leverage: 'Leverage',
    limit: 'Limit',
    market: 'Market',
    margin: 'Margin',
    emptyOrders: 'No orders found',
    emptyPositions: 'No positions found',
    emptyTrades: 'No trades found',
    entry_price: 'Entry price',
    liquidation_price: 'Liquidation price',
    liquidation_price_tooltip:
      'The price at which your position will be liquidated or force-exited to prevent further losses.',
    unrealized_pnl: 'Unrealized PnL',
    unrealized_pnl_tooltip:
      'The unrealized PnL is an approximation of the realized profit or loss if the position was to be closed.',
    long: 'Long',
    short: 'Short'
  },

  spot: {
    market: 'market',
    price: 'price',
    total: 'total',
    leverage: 'leverage',
    unfilled: 'unfilled'
  }
}
