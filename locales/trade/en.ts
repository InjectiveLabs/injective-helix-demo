import { I18nMessageFunction } from '@/types'

export default {
  trade: {
    get: 'Get',
    asset_only: ({ named }: I18nMessageFunction) => `${named('asset')} only`,
    assetTransfer: 'Asset Transfer',
    assetTransferTooltip: 'The asset you want to transfer',
    all: 'All',
    allMarkets: 'All Markets',
    timestamp: 'Time stamp',
    tensMultiplierRounded:
      'Automatically rounded down to the nearest multiple of {minTickSize}',
    timestamp_tooltip: 'Based on your browser time zone',
    quantity: 'Quantity',
    notional: 'Notional',
    chart: 'Chart',
    'pro-chart': 'Pro Chart',
    depth: 'Depth',
    info: 'Info',
    pair: 'Pair',
    type: 'Type',
    tpSl: 'TP/SL',
    take_Profit: 'Take Profit',
    stop_Loss: 'Stop Loss',
    enable: 'Enable',
    status: 'Status',
    type_tooltip: 'The type of your order: limit or market.',
    side: 'Side',
    postOnly: 'Post Only',
    side_tooltip: 'The side of your trade: long or short',
    price: 'Price',
    trigger_price: 'Trigger Price',
    limit_price: 'Limit Price',
    limitPrice: 'Limit Price',
    amount: 'Amount',
    advancedSettings: 'Advanced Settings',
    cancel: 'Cancel',
    cancelOrder: 'Cancel Order',
    min_received_amount: 'Mininum Received Amount',
    averagePrice: 'Average Price',
    amount_tooltip:
      'The total value of the base asset at the time which the trade was executed (i.e. for BTC/USDT, BTC is the base asset and USDT is the quote asset).',
    filled: 'Filled',
    total: 'Total',
    reduceOnly: 'Reduce Only',
    total_tooltip:
      'The total value of the position which is determined by the mark price with the following formula: Mark Price * Base Asset Amount.',
    fee: 'Fee',
    fees_tooltip:
      'Trading fees associated with the trade. Trading fees on Injective can be lowered using rebates.',
    buy: 'Buy',
    buyLong: 'Buy/Long',
    sell: 'Sell',
    sellShort: 'Sell/Short',
    unfilled: 'Unfilled',
    filter: 'Filter by asset',
    cancelAll: 'Cancel All',
    cancelAllOrders: 'Cancel all orders',
    cancelAllTriggers: 'Cancel all Triggers',
    clearAll: 'Clear All',
    closeAll: 'Close All',
    closeAllPositions: 'Close all positions',
    reduce_only: 'Reduce-Only',
    post_only: 'Post-Only',
    leverage: 'Leverage',
    triggerCondition: 'Trigger condition',
    limit: 'Limit',
    limitFill: 'Limit Fill',
    market: 'Market',
    'stop-limit': 'Stop-Limit',
    stopLimit: 'Stop-Limit',
    'stop-market': 'Stop-Market',
    stopMarket: 'Stop-Market',
    margin: 'Margin',
    lastPrice: 'Last Price',
    margin_tooltip: 'The total margin required to execute the trade.',
    emptyOrders: 'No orders found',
    emptyPositions: 'No positions found',
    emptyTrades: 'No trades found',
    emptySwaps: 'No swaps found',
    emptyTriggers: 'No triggers found',
    entry_price: 'Entry price',
    liquidation_price: 'Liquidation Price',
    closePosition: 'Close Position',
    liquidation_price_tooltip:
      'The price at which your position will be liquidated or force-exited to prevent further losses.',
    unrealized_pnl: 'Unrealized PnL',
    unrealized_pnl_tooltip:
      'The unrealized PnL is an approximation of the realized profit or loss if the position was to be closed.',
    long: 'Long',
    short: 'Short',
    available_asset: ({ named }: I18nMessageFunction) =>
      `Available ${named('asset')}`,
    availableAmount: 'Available: {amount}',
    buy_asset: ({ named }: I18nMessageFunction) => `Buy ${named('asset')}`,
    sell_asset: ({ named }: I18nMessageFunction) => `Sell ${named('asset')}`,
    not_enough_fillable_orders:
      'There are not enough orders to fill this amount',
    balance_higher_than_orderbook_liquidity:
      'Balance is higher than orderbook liquidity',
    order_placed: 'Your order has been placed',
    error_in_form: 'There are errors in your form',
    volume_asset: ({ named }: I18nMessageFunction) =>
      `24h Volume (${named('asset')})`,
    high: '24h High',
    low: '24h Low',
    perpetuals: 'Perpetuals',
    perpetual: 'Perpetual',
    spots: 'Spot',
    futures: 'Futures',
    trading: 'Trading',
    high_execution_price_deviation_warning_note: ({
      named
    }: I18nMessageFunction) =>
      `The execution price for your order deviates at least ${named(
        'percentage'
      )}% from the last traded price. Click confirm if you still want to execute it.`,
    order_price_low_warn: 'Order price is too low',
    order_price_high_warn: 'Order price is too high',
    max_leverage_warn: 'Please decrease leverage',
    reduce_only_in_excess:
      'Total size of reduce-only orders would exceed size of your position',
    max_leverage: ({ named }: I18nMessageFunction) =>
      `Max Leverage:  ${named('max')}`,
    you_can_only_have_max_orders: ({ named }: I18nMessageFunction) =>
      `You can only have ${named(
        'number'
      )} orders per side per market per trading account`,
    no_liquidity: 'Not enough Liquidity',
    add_margin_to_position_title: 'Add Margin',
    order_insufficient_margin:
      'Please modify price, amount, or leverage to meet margin requirement',
    mark_price_invalid:
      'Please modify price, amount, or leverage to meet mark price requirement',
    success_added_margin: 'You have successfully added margin to your position',
    add_margin: 'Add Margin',
    fee_order_details_note_negative_margin:
      "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you are not going to pay any trading fees.",
    fee_order_details_note: ({ named }: I18nMessageFunction) =>
      `Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you will only need to pay ${named(
        'feeReturned'
      )} in fees.`,
    buy_long: 'Buy/Long',
    sell_short: 'Sell/Short',
    mark_price: 'Mark Price',
    mark_price_tooltip: 'The oracle price for the base asset.',
    mark_price_tooltip_verbose:
      'Mark Price: The oracle price for the base asset.',
    funding_rate_tooltip:
      'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.',
    estFeeRebate: 'Est. Fee Rebate',
    estFeeRebate_note:
      'The estimated rebate is the rebate that is granted if the limit order is filled as a maker order.',
    funding_fee: 'Funding fee',
    funding_rate: 'Funding Rate',
    est_funding_rate: 'Est. Funding Rate',
    expiry_time: 'Expiry Time',
    expiry_time_with_timezone: ({ named }: I18nMessageFunction) =>
      `Expiry Time (${named('timezone')})`,
    time_to_expiry: 'Time to expiry',
    derivatives: 'Derivatives',
    not_available_n_a: 'N/A',
    position_closed: 'Position Closed',
    insufficient_balance: 'Insufficient balance',
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
    volumeUsd: 'Volume (USD)',
    volume_24h: 'Volume (24H)',
    total_market_volume_24h: 'Total Volume (24H)',
    usd_value: 'USD Value',
    usd_value_tooltip: 'The USD value based on the quote asset price',
    market_change_24h_tooltip: 'The change in price over the past 24 hours.',
    market_volume_24h: 'Volume (24h)',
    market_volume_24h_tooltip: 'The total trade volume over the past 24 hours.',
    search_market: 'Search Market',
    search_markets: 'Search Markets',
    marketNotFound: 'Market not found',
    favorites: 'Favorites',
    spot: 'Spot',
    asset: 'Asset',
    average_price: 'Average price',
    total_volume_in_quote: ({ named }: I18nMessageFunction) =>
      `Volume in ${named('symbol')}`,
    total_volume_in_base: ({ named }: I18nMessageFunction) =>
      `Volume in ${named('symbol')}`,
    order_success_canceling: 'Order Cancelled',
    trade: 'Trade',
    trades: 'Trades',
    tradeHistoryDetails: 'Trade History Details',
    time: 'Time',
    timeTooltip: ({ named }: I18nMessageFunction) =>
      `The time at which the ${named('type')} occurred.`,
    timeTooltipUpdated: ({ named }: I18nMessageFunction) =>
      `The time at which the ${named('type')} was updated.`,
    max: 'Max',
    orderbook: 'Orderbook',
    standard: 'Standard',
    'trading-bots': 'Trading Bots',
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
    fees_tooltip_discount: ({ named }: I18nMessageFunction) =>
      `Based on your tier, you are eligible for ${named(
        'maker'
      )}% maker discount and ${named('taker')}% taker discount.`,
    taker_fees_tooltip_discount: ({ named }: I18nMessageFunction) =>
      `Based on your tier, you are eligible for ${named(
        'taker'
      )}% taker discount.`,
    quote_denoms: 'Quote Denoms',
    quote_denoms_tooltip:
      'Markets involving these assets are qualified for Trade & Earn unless explicitly disqualified otherwise (check disqualified markets). Whether that be a derivatives market using these assets as margin, or a spot market using these assets as either base or quote currency.',
    maker_taker_rate: 'Maker/Taker Fee Rate',
    maker_taker_rate_note:
      'Maker/Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
    taker_rate: 'Taker Fee Rate',
    taker_rate_note:
      'Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
    maker_rate: 'Maker Fee Rate',
    maker_rate_note:
      'Maker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
    expected_points: 'Expected Points',
    expected_points_note:
      'The expected points you will earn for the Injective Astro incentive program based on the execution type of your order (maker or taker).',
    execution_price_far_away_from_last_traded_price:
      'Please note that the execution price for this trade deviates a lot from the last traded price.',
    trigger_price_zero: 'The trigger price must be higher than 0.',
    trigger_price_equals_mark_price:
      'The trigger price cannot be the same as the mark price.',
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
    position_market_not_found: ({ named }: I18nMessageFunction) =>
      `Market for position ${named('marketId')} cannot be found`,
    entryMark: 'Entry / Mark',
    estLiqPrice: 'EST Liq Price',
    balance: ({ named }: I18nMessageFunction) => `Balance: ${named('balance')}`,
    slippageWarnings: {
      exceed: 'Slippage can not be higher than 50%.',
      tooLow:
        'Your transaction might not be executed if slippage % is set too low.',
      tooHigh:
        'Your transaction might be executed at a less desirable price if slippage % is set too high.'
    },
    advanced_settings: 'Advanced Settings',
    slippage_tolerance: 'Slippage Tolerance',
    invalid_slippage: 'Please enter a valid slippage percentage',
    details: 'Details',
    binaryOptions: {
      settlement: 'Settlement',
      settlement_tooltip: 'Settlement Tooltip'
    },
    slippage_cancellation_notice:
      'Note: If the execution price exceeds the 0.5% slippage protection, your order will be automatically cancelled.',
    takeProfit: 'Take-Profit',
    stopLoss: 'Stop-Loss',
    stopLossLimit: 'Stop-Loss Limit',
    stopLossMarket: 'Stop-Loss Market',
    takeProfitLimit: 'Take-Profit Limit',
    takeProfitMarket: 'Take-Profit Market',
    generated: 'Generated',
    confirmOrderModal: {
      descriptionLimit: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'If the mark price ',
          named('verb'),
          ' to or ',
          named('preposition'),
          ' ',
          named('triggerPrice'),
          ' ',
          named('triggerPriceSymbol'),
          ' a ',
          named('reduceOnly'),
          ' limit order to ',
          named('orderType'),
          ' ',
          named('amount'),
          ' ',
          named('amountSymbol'),
          ' at a price of ',
          named('price'),
          ' ',
          named('priceSymbol'),
          ' will be placed.'
        ]),
      descriptionMarket: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'If the mark price ',
          named('verb'),
          ' to or ',
          named('preposition'),
          ' ',
          named('triggerPrice'),
          ' ',
          named('triggerPriceSymbol'),
          ' a ',
          named('tradingType'),
          ' order to ',
          named('orderType'),
          ' ',
          named('amount'),
          ' ',
          named('amountSymbol'),
          ' will be placed.'
        ]),
      doNotShowThisConfirmationAgain: 'Do not show this confirmation again',
      rises: 'rises',
      drops: 'drops',
      above: 'above',
      below: 'below'
    },
    reduceOnlyTooltip:
      'To place a reduce-only order, you will need an open position in the opposite side.',
    reduceOnlyTooltipConditional:
      'To place a reduce-only conditional order, you will need an open position or non reduce-only order in the opposite side.',
    open: 'Open',
    partialFilled: 'Partial Filled',
    partiallyFilled: 'Partially Filled',
    cancelled: 'Cancelled',
    spotTradeHistoryTotalTooltip: 'Total value of the order in quote currency',
    tradingLayout: 'Trading Layout',
    tradingLayoutOptions: {
      left: 'Left',
      right: 'Right'
    },

    swap: {
      to: 'To',
      fee: 'Fee',
      fees: 'Fees',
      swap: 'Swap',
      from: 'From',
      rate: 'Rate',
      route: 'Route',
      youPay: 'You pay',
      convert: 'Convert',
      outgoing: 'Outgoing',
      incoming: 'Incoming',
      youReceive: 'You receive',
      backToSwap: 'Back to Swap',
      enterAmount: 'Enter amount',
      goToAccount: 'Go to Account',
      maximumInput: 'Maximum Input',
      tolerance: 'Slippage Tolerance',
      minimumOutput: 'Minimum output',
      connect_wallet: 'Connect Wallet',
      fetching_price: 'Fetching price',
      expectedOutput: 'Expected output',
      viewTransaction: 'View Transaction',
      advancedSettings: 'Advanced Settings',
      currentlyOffline: 'Currently offline',
      somethingWentWrong: 'Something went wrong.',
      insufficient_balance: 'Insufficient Balance',
      rateExpired: 'Rate expired. Click to Update',
      swapAmountTooLow: 'The swap amount is too low',
      swapSuccessfully: 'Swap executed successfully!',
      swappedSuccessfully: 'Swapped successfully!',
      insufficient_liquidity: 'Insufficient Liquidity',
      pleaseTryAgain: 'Please reload page to try again.',
      pleaseTopUp: 'Please top up your trading account.',
      tooltip:
        'Your transaction will be automatically cancelled if the price changes unfavorably by more than this percentage.',
      tokenSelector: {
        selectToken: 'Select Token',
        selectAToken: 'Select a token',
        searchBy: 'Search by name or symbol'
      },
      swapTime: ({ named }: I18nMessageFunction) =>
        `Swap (${named('swapTimeRemaining')}s)`,
      insufficient_balance_verbose: ({ named }: I18nMessageFunction) =>
        `Insufficient ${named(
          'symbol'
        )} balance for this conversion. Please top up your trading account.`,
      youHaveSwapped: ({ named }: I18nMessageFunction) =>
        `You have swapped ${named('inputAmount')} ${named(
          'inputTokenSymbol'
        )} to ${named('outputAmount')} ${named('outputTokenSymbol')}`,
      priceWarning: ({ named }: I18nMessageFunction) =>
        `High slippage detected! Only proceed if you understand you might receive less ${named(
          'symbol'
        )} than anticipated.`
    },

    lastUpdated: 'Last Updated'
  }
}
