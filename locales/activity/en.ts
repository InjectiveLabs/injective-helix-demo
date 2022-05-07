export default {
  activity: {
    activities: 'Activities',
    activity: 'Activity',
    spotOrders: 'Spot Orders',
    derivativeOrders: 'Derivative Orders',
    rewardHistory: 'Reward History',
    walletHistory: 'Wallet History',
    fundingPayments: 'Funding Payments',
    openOrders: 'Open Orders',
    tradeHistory: 'Trade History',
    positions: 'Positions',
    ordersHistory: 'Orders History',
    openPositions: 'Open positions',
    cancelOrders: 'Cancel Orders',
    funds: 'Funds'
  },

  fundingPayments: {
    emptyFundingPayments: 'No funding payments found',
    payment: 'Payment',
    paymentTooltip:
      'A positive payment means you received funding, while a negative payment means you paid funding. Funding is automatically reflected in your open position margin.',
    rate: 'Rate',
    rateTooltip:
      'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.'
  },

  rewardsHistory: {
    emptyTradingRewards: 'No distributed trading rewards found'
  },

  walletHistory: {
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    emptySubaccountTransfers: 'No subaccount transfers found',
    emptyDepositTransactions: 'No deposits found',
    emptyWithdrawalTransactions: 'No withdrawals found',
    subaccountDepositType: 'Injective Wallet to Trading Account',
    subaccountWithdrawalType: 'Trading Account to Injective Wallet',
    INJTransferType: 'Injective to Injective',
    ethDepositType: 'Ethereum to Injective',
    axelarDepositType: 'Axelar to Injective',
    chihuahuaDepositType: 'Chihuahua to Injective',
    cosmosDepositType: 'Cosmos Hub to Injective',
    junoDepositType: 'Juno to Injective',
    osmosisDepositType: 'Osmosis to Injective',
    terraDepositType: 'Terra to Injective',
    ethWithdrawalType: 'Injective to Ethereum',
    axelarWithdrawalType: 'Injective to Axelar',
    chihuahuaWithdrawalType: 'Injective to Chihuahua',
    cosmosWithdrawalType: 'Injective to Cosmos Hub',
    junoWithdrawalType: 'Injective to Juno',
    osmosisWithdrawalType: 'Injective to Osmosis',
    terraWithdrawalType: 'Injective to Terra',

    transfers: {
      origin: 'Origin',
      destination: 'Destination',
      asset: 'Asset',
      transfers: 'Transfers',
      type: 'Type',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      amount: 'Amount',
      in: 'In',
      out: 'Out',
      amountTooltip: 'The amount that was transferred'
    }
  },

  trade: {
    asset_only: '{asset} only',
    assetTransfer: 'Asset Transfer',
    assetTransferTooltip: 'The asset you want to transfer',
    all: 'All',
    allMarkets: 'All Markets',
    timestamp: 'Time stamp',
    timestamp_tooltip: 'Based on your browser time zone',
    chart: 'Chart',
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
    margin_tooltip: 'The total margin required to execute the trade.',
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
    short: 'Short',
    available_asset: 'Available {asset}',
    buy_asset: 'Buy {asset}',
    sell_asset: 'Sell {asset}',
    not_enough_fillable_orders:
      'There are not enough orders to fill this amount',
    order_placed: 'Your order has been placed',
    error_in_form: 'There are errors in your form',
    volume_asset: '24h Volume ({asset})',
    high: '24h High',
    low: '24h Low',
    perpetuals: 'Perpetuals',
    perpetual: 'Perpetual',
    spots: 'Spot',
    futures: 'Futures',
    trading: 'Trading',
    high_execution_price_deviation_warning_note:
      'The execution price for your order deviates at least {percentage}% than the last traded price. Click confirm if you still want to execute it.',
    order_price_low_warn: 'Order price is too low',
    order_price_high_warn: 'Order price is too high',
    max_leverage_warn: 'Please decrease leverage.',
    reduce_only_in_excess:
      'Total size of reduce-only orders would exceed size of your position',
    max_leverage: 'Max Leverage:  {max}',
    you_can_only_have_max_orders:
      'You can only have {number} orders per side per market per trading account',
    no_liquidity: 'Not enough Liquidity',
    add_margin_to_position_title: 'Add Margin',
    order_insufficient_margin: 'Order has insufficient margin',
    mark_price_invalid: 'The mark price is not valid',
    success_added_margin: 'You have successfully added margin to your position',
    add_margin: 'Add Margin',
    fee_order_details_note_negative_margin:
      "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you are not going to pay any trading fees.",
    fee_order_details_note:
      "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you will only need to pay {feeReturned} in fees.",
    buy_long: 'Buy/Long',
    sell_short: 'Sell/Short',
    mark_price: 'Mark Price',
    mark_price_tooltip: 'The oracle price for the base asset.',
    funding_rate_tooltip:
      'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.',
    est_receiving_amount: 'Est. Receiving Amount (Worst Case)',
    est_receiving_amount_note:
      'The lowest amount you can actually receive for the trade.',
    est_fee_rebate: 'Est. Fee Rebate',
    est_fee_rebate_note:
      'The estimated rebate is the rebate that is granted if the limit order is filled as a maker order.',
    funding_fee: 'Funding fee',
    funding_rate: 'Funding Rate',
    est_funding_rate: 'Est. Funding Rate',
    expiry_date: 'Expiry Date',
    derivatives: 'Derivatives',
    not_available_n_a: 'N/A',
    position_closed: 'Position Closed',
    not_enough_balance: 'Not enough balance',
    reduce_only_exceed_position:
      'Total size of reduce-only orders exceed the size of your position',
    worst_price_note:
      'Note: If the execution price exceeds the {slippage}% slippage protection, your order will be automatically cancelled',
    next_funding: 'Next Funding',
    next_funding_tooltip:
      'The time remaining for the end of the funding interval.',
    trade_placed: 'Trade placed',
    notional_value: 'Notional Value',
    open_orders: 'Open Orders',
    trade_history: 'Trade History',
    last_price: 'Last Price',
    last_traded_price: 'Last Traded Price',
    last_traded_price_tooltip: 'The last price at which a trade occurred.',
    market_change: 'Change',
    market_change_24h: 'Change (24h)',
    volume: 'Volume',
    volume_24h: 'Volume (24H)',
    total_market_volume_24h: 'Total Volume (24H)',
    market_change_24h_tooltip: 'The change in price over the past 24 hours.',
    market_volume_24h: 'Volume (24h)',
    market_volume_24h_tooltip: 'The total trade volume over the past 24 hours.',
    search_markets: 'Search Markets',
    filter_markets: 'Filter Markets',
    favorites: 'Favorites',
    spot: 'Spot',
    asset: 'Asset',
    average_price: 'Average price',
    total_volume_in_quote: 'Volume in {symbol}',
    total_volume_in_base: 'Volume in {symbol}',
    order_success_canceling: 'Order Cancelled',
    trade: 'Trade',
    trades: 'Trades',
    time: 'Time',
    max: 'Max',
    orderbook: 'Orderbook',
    markets: 'Markets',
    availableMargin: 'Available Margin',
    availableMarginTooltip: 'The available margin you can add to this position',
    confirmOrderExecution: 'Confirm order execution',
    fees_paid: 'Fees Paid',
    myMakerTakerDiscount: 'Maker/Taker Rate Discount',
    myMakerTakerDiscountTooltip:
      'Your current trading fee discount based on your fee tier.',
    market_total_tooltip:
      'This total is calculated based on the approximated price you are going to get when execution the trade. Please note that the Total you end up with might have a slight deviation from the value shown here, as slippage is also applied on the execution price.',
    fees_tooltip_discount:
      'Based on your tier, you are eligible for {maker}% maker discount and {taker}% taker discount.',
    quote_denoms: 'Quote Denoms',
    quote_denoms_tooltip:
      'Markets involving these assets are qualified for Trade & Earn unless explicitly disqualified otherwise (check disqualified markets). Whether that be a derivatives market using these assets as margin, or a spot market using these assets as either base or quote currency.',
    maker_taker_rate: 'Maker/Taker Fee Rate',
    maker_taker_rate_note:
      'Maker/Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
    taker_rate: 'Taker Fee Rate',
    taker_rate_note:
      'Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
    expected_points: 'Expected Points',
    expected_points_note:
      'The expected points you will earn for the Injective Astro incentive program based on the execution type of your order (maker or taker).',
    your_order_has_high_price_deviation:
      'The execution price for this trade is far away from the current orderbook mid price.',
    execution_price_far_away_from_last_traded_price:
      'Please note that the execution price for this trade deviates a lot from the last traded price.',
    there_are_no_disqualified_markets_on_this_relayer:
      'There are no disqualified markets on this relayer.',
    liquidation: 'Liquidation',
    marketsInformation: 'Markets Information',
    boosted_markets: 'Market Rewards',
    boosted_markets_tooltip:
      'The reward rate for taker and maker orders in each market. For example: 3x maker pts means that trading fees paid by maker orders in this market will receive reward points equal to 3 times the value of trading fees.',
    disqualified_markets: 'Disqualified Markets',
    disqualified_markets_tooltip:
      'Markets that are disqualified from Trade & Earn. Trading activity in these markets will not earn any reward points.',
    orders_cancelled: 'Your orders have been cancelled',
    positions_closed: 'Your positions have been closed',
    not_valid_number: 'Not a valid number',
    enter_your_amount: 'Enter your amount',
    position_market_not_found: 'Market for position {marketId} cannot be found'
  }
}
