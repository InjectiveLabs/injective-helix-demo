export default {
  activities: {
    activities: 'Activities',
    spotOrders: 'Spot Orders',
    derivativeOrders: 'Derivative Orders',
    earnHistory: 'Earn History',
    transactionHistory: 'Transaction History',
    orders: 'Orders',
    trades: 'Trades',
    ordersHistory: 'Orders History',
    cancelOrders: 'Cancel Orders',
    cancelOrdersSuccess: 'Your orders have been cancelled'
  },

  trade: {
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
    total_tooltip: 'The total value of the position which is determined by the mark price with the following formula: Mark Price * Base Asset Amount.',
    fee: 'Fee',
    fees_tooltip:
      'Trading fees associated with the trade. Trading fees on Injective can be lowered using rebates.',
    buy: 'Buy',
    sell: 'Sell',
    filter: 'Filter asset'
  },

  spot: {
    market: 'market',
    price: 'price',
    total: 'total',
    leverage: 'leverage',
    unfilled: 'unfilled'
  }
}
