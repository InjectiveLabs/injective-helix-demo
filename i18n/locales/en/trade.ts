import { MarketsTableColumn, MarketsSelectorTableColumn } from '@/types'

export default {
  trade: {
    table: {
      markets: {
        [MarketsTableColumn.Markets]: 'Markets',
        [MarketsTableColumn.LastPrice]: 'Last Price',
        [MarketsTableColumn.MarketChange24h]: 'Change (24h)',
        [MarketsTableColumn.MarketVolume24h]: 'Volume (24h)'
      },
      marketsSelector: {
        [MarketsSelectorTableColumn.Markets]: 'Markets',
        [MarketsSelectorTableColumn.LastPrice]: 'Last Price',
        [MarketsSelectorTableColumn.MarketChange24h]: 'Change (24h)',
        [MarketsSelectorTableColumn.FundingRate]: 'Est. Funding (1h)',
        [MarketsSelectorTableColumn.MarketVolume24h]: 'Volume (24h)'
        // [MarketsSelectorTableColumn.OpenInterest]: 'Open Interest'
      }
    },
    stats: {
      annualized: 'Annualized',
      usd_value: 'USD Value',
      usd_value_tooltip: 'The USD value based on the quote asset price',
      volumeInUsd: 'Volume USD (24h)',
      est_funding_rate: 'Est. Funding Rate',
      funding_rate_tooltip:
        'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.',
      high: '24h High',
      low: '24h Low',
      marketCap: 'Market Cap',
      marketCapTooltip:
        'The market cap is calculated by multiplying the current price by the current circulating supply. Some tokens on Injective have an infinite maximum supply.',
      // open_interest: 'Open Interest (USDT)',
      // open_interest_tooltip:
      //   'Total outstanding position of all traders of this contract',
      market_volume_24h: 'Volume (24h)',
      market_volume_24h_tooltip:
        'The total trade volume over the past 24 hours.',
      next_funding: 'Next Funding',
      total_market_volume_24h: 'Total Volume (24h)',
      next_funding_tooltip:
        'The time remaining for the end of the funding interval.',
      mark_price_tooltip:
        'Used for computing unrealised PNL and triggering liquidations'
    },
    get: 'Get',
    asset_only: '{asset} only',
    assetTransfer: 'Asset Transfer',
    assetTransferTooltip: 'The asset you want to transfer',
    all: 'All',
    slippage: 'Slippage',
    allMarkets: 'All Markets',
    timestamp: 'Time stamp',
    tickSize: 'Tick Size',
    pnlPercent: 'PnL% (Open Position)',
    marketName: 'Market Name',
    maxLeverage: 'Max. Leverage',
    minLimitOrderSize: 'Min. Limit Order Size',
    tensMultiplierRounded:
      'Automatically rounded down to the nearest multiple of {minTickSize}',
    minNotionalError: 'Minimum order value > {minNotional} {symbol}',
    timestamp_tooltip: 'Based on your browser time zone',
    mid: 'Mid',
    chase: 'Chase',
    chaseTooltip:
      'Click Chase to automatically modify this open limit order to the current best bid/ask price. You must have auto-sign enabled to use this feature.',
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
    bypassPriceWarning: 'Bypass Price Warning',
    side_tooltip: 'The side of your trade: long or short',
    price: 'Price',
    priceInUsd: 'Price in USD',
    avgPrice: 'Avg. Price',
    totalQuantity: 'Total Quantity ({symbol})',
    totalVolume: 'Total Volume ({symbol})',
    trigger_price: 'Trigger Price',
    limit_price: 'Limit Price',
    limitPrice: 'Limit Price',
    triggerPrice: 'Trigger Price',
    priceDeviation: 'Price Deviation',
    orderStatus: 'Order Status',
    amount: 'Amount',
    size: 'Size',
    tickerOnly: '{ticker} only',
    advancedSettings: 'Advanced Settings',
    totalNotional: 'Total Notional',
    cancel: 'Cancel',
    cancelTrigger: 'Cancel Trigger',
    cancelOrder: 'Cancel Order',
    min_received_amount: 'Mininum Received Amount',
    averagePrice: 'Average Price',
    worstPrice: 'Worst Price',
    amount_tooltip:
      'The total value of the base asset at the time which the trade was executed (i.e. for BTC/USDT, BTC is the base asset and USDT is the quote asset).',
    filled: 'Filled',
    total: 'Total',
    entryPrice: 'Entry Price',
    markPrice: 'Mark Price',
    previousMarkPrice: 'Previous Mark Price',
    takeProfitTriggerPrice: 'Take Profit Trigger Price',
    takeProfitQuantity: 'Take Profit Quantity',
    stopLossTriggerPrice: 'Stop Loss Trigger Price',
    stopLossQuantity: 'Stop Loss Quantity',
    direction: 'Direction',
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
    addTpSl: 'Add TP/SL',
    takeProfitStopLoss: 'Take Profit / Stop Loss',
    takeProfitStopLossForPosition: 'Take Profit / Stop Loss For Position',
    cancelTakeProfit: 'Cancel Take Profit',
    cancelStopLoss: 'Cancel Stop Loss',
    lastPrice: 'Last Price',
    margin_tooltip: 'The total margin required to execute the trade.',
    emptyOrders: 'No orders found',
    emptyPositions: 'No positions found',
    emptyTrades: 'No trades found',
    emptySwaps: 'No swaps found',
    emptyAdvancedOrders: 'No Advanced Orders Found',
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
    // open_interest: 'Open interest',
    available_asset: 'Available {asset}',
    availableAmount: 'Available: {amount}',
    buy_asset: 'Buy {asset}',
    sell_asset: 'Sell {asset}',
    not_enough_fillable_orders:
      'There are not enough orders to fill this amount',
    balance_higher_than_orderbook_liquidity:
      'Balance is higher than orderbook liquidity',
    order_placed: 'Your order has been placed',
    orderUpdated: 'Your order has been updated',
    error_in_form: 'There are errors in your form',
    volume_asset: '24h Volume ({asset})',
    perpetuals: 'Perpetuals',
    perpetual: 'Perpetual',
    spots: 'Spot',
    futures: 'Futures',
    trading: 'Trading',
    staked: 'Staked',
    stakedUsd: 'Staked (USD)',
    high_execution_price_deviation_warning_note:
      'The execution price for your order deviates at least {percentage}% from the last traded price. Click confirm if you still want to execute it.',
    order_price_low_warn: 'Order price is too low',
    order_price_high_warn: 'Order price is too high',
    max_leverage_warn: 'Please decrease leverage',
    reduce_only_in_excess:
      'Total size of reduce-only orders would exceed size of your position',
    max_leverage: 'Max Leverage: {max}',
    you_can_only_have_max_orders:
      'You can only have {number} orders per side per market per trading account',
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
    fee_order_details_note:
      "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you will only need to pay {feeReturned} in fees.",
    buy_long: 'Buy/Long',
    sell_short: 'Sell/Short',
    mark_price: 'Mark Price',
    mark_price_tooltip: 'The oracle price for the base asset.',
    mark_price_tooltip_verbose:
      'Mark Price: The oracle price for the base asset.',
    estFundingRate: 'Est. Funding Rate',
    estFeeRebate: 'Est. Fee Rebate',
    estFeeRebate_note:
      'The estimated rebate is the rebate that is granted if the limit order is filled as a maker order.',
    funding_fee: 'Funding fee',
    funding_rate: 'Funding Rate',
    expiry_time: 'Expiry Time',
    expiry_time_with_timezone: 'Expiry Time ({timezone})',
    time_to_expiry: 'Time to expiry',
    derivatives: 'Derivatives',
    not_available_n_a: 'N/A',
    position_closed: 'Position Closed',
    insufficient_balance: 'Insufficient balance',
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
    volume_24h: 'Volume (24h)',
    market_change_24h_tooltip: 'The change in price over the past 24 hours.',
    search_market: 'Search Market...',
    total_volume_in_usd: '{amount} USD',
    marketNotFound: 'Market not found',
    favorites: 'Favorites',
    spot: 'Spot',
    asset: 'Asset',
    average_price: 'Average price',
    total_volume_in_quote: 'Volume in {symbol}',
    total_volume_in_base: 'Volume in {symbol}',
    order_success_canceling: 'Order Cancelled',
    trade: 'Trade',
    trades: 'Trades',
    tradeHistoryDetails: 'Trade History Details',
    time: 'Time',
    timeTooltip: 'The time at which the {type} occurred.',
    timeTooltipUpdated: 'The time at which the {type} was updated.',
    max: 'Max',
    noTrades: 'No trades',
    noOrders: 'No orders',
    orderbook: 'Orderbook',
    standard: 'Standard',
    'trading-bots': 'Trading Bots',
    markets: 'Markets',
    availableMargin: 'Available Margin',
    availableMarginTooltip: 'The available margin you can add to this position',
    fees_paid: 'Fees Paid',
    myMakerTakerDiscount: 'Maker/Taker Rate Discount',
    myMakerTakerDiscountTooltip:
      'Your current trading fee discount based on your fee tier.',
    market_total_tooltip:
      'This total is calculated based on the approximated price you are going to get when execution the trade. Please note that the Total you end up with might have a slight deviation from the value shown here, as slippage is also applied on the execution price.',
    fees_tooltip_discount:
      'Based on your tier, you are eligible for {maker}% maker discount and {taker}% taker discount.',
    taker_fees_tooltip_discount:
      'Based on your tier, you are eligible for {taker}% taker discount.',
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
    position_market_not_found: 'Market for position {marketId} cannot be found',
    entryMark: 'Entry / Mark',
    estLiqPrice: 'EST Liq Price',
    balance: 'Balance: {balance}',
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
      descriptionLimit:
        'If the mark price {verb} to or {preposition} {triggerPrice} {triggerPriceSymbol} a {reduceOnly} limit order to {orderType} {amount} {amountSymbol} at a price of {price} {priceSymbol} will be placed.',
      descriptionMarket:
        'If the mark price {verb} to or {preposition} {triggerPrice} {triggerPriceSymbol} a {tradingType} order to {orderType} {amount} {amountSymbol} will be placed.',
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
    triggered: 'Triggered',
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
      swapTime: 'Swap ({swapTimeRemaining}s)',
      insufficient_balance_verbose:
        'Insufficient {symbol} balance for this conversion. Please top up your trading account.',
      youHaveSwapped:
        'You have swapped {inputAmount} {inputTokenSymbol} to {outputAmount} {outputTokenSymbol}',
      priceWarning:
        'High slippage detected! Only proceed if you understand you might receive less {symbol} than anticipated.'
    },

    profitLoss: 'Profit/Loss',
    lastUpdated: 'Last Updated',
    totalQuantitySize: 'Total Quantity Size',
    estLiquidationPrice: 'Est. Liquidation Price',
    tpSuccessMessage:
      'your take profit order has been set for {quantity} quantity at {price} price',
    slSuccessMessage:
      'your stop loss order has been set for {quantity} quantity at {price} price',
    takeProfitDetails:
      'When Mark Price reaches {price}, it will trigger a Take Profit Market order for {quantity}.',
    stopLossDetails:
      'When Mark Price reaches {price}, it will trigger a Stop Loss Market order for {quantity}.',

    rwa: {
      statusOfThisMarket: 'Status of this market',
      closed: 'Closed',
      confirm: 'Confirm',
      cancel: 'Cancel',
      warning: 'Warning',
      acknowledge:
        'I understand, I accept the risk, and I wish to proceed with my trade.',
      marketClosedModal:
        'Trades can be placed, but the mark price will not update until the market reopens, which may increase your trading risk. {marketClosedTimes} between 5pm (ET) Friday and 5pm (ET) Sunday, on CME trading holidays, and between 5pm (ET) and 6pm (ET) Monday to Thursday.',
      marketClosedTrade:
        'All markets on Helix can be traded 24/7. It should be noted that this market follows {marketClosedTimes}. Markets are closed between 5pm (ET) Friday and 5pm (ET) Sunday, on CME trading holidays, and between 5pm (ET) and 6pm (ET) Monday to Thursday.',
      nyseMarketClosedTrade:
        'All markets on Helix can be traded 24/7. It should be noted that this market follows {nyseClosedTimes}, 2:30pm UTC through 9pm UTC, closing on nights, weekends, and NYSE trading holidays.',

      marketClosedToast:
        'This market is currently closed. You may place a trade anyway, but beware of the risks involved.',
      tradesCanBePlace:
        'Trades can be placed outside of these times, but prices will not update until the market reopens.',
      thisMayIncreaseYourTradingRisk: 'This may increase your trading risk.',
      tradfiMarketClosedTrade:
        'This market follows traditional NYSE trading hours',
      rwaClosedTimes: ' traditional RWA price feeds',
      rwaClosedMarketRow: 'This market follows traditional RWA price feeds.',
      nyseClosedTimes: 'NYSE trading hours',
      nyseClosedMarketRow: 'This market follows NYSE trading hours.',
      acceptRisk: 'By proceeding, you acknowledge and accept this risk.',
      marketIsClosed: 'This market is currently closed.',
      submit: 'Submit Trade'
    },

    liquidationModal: {
      title: 'Warning',
      description:
        'Opening a new position in these conditions could result in immediate liquidation. Are you sure you wish to proceed?',
      cta: 'Proceed anyway'
    },

    marketMultiplierBanner: {
      description:
        "This market offers {multiplier}x multipliers for 'Like a G' competition entries starting {startDate} for {duration} hours. Multipliers will be reflected on the leaderboard at a later time. {terms} apply."
    },

    ftmMarketBanner: {
      settleMarket:
        'There is currently a governance proposal to force settle this market. You are encouraged to close open positions, or you will be force liquidated at the mark price at the time of settlement.'
    },

    equity: {
      spot: 'Spot',
      perps: 'Perps',
      title: 'Account Equity',
      unrealizedPnl: 'Unrealized PnL'
    },

    yes: 'Yes',
    no: 'No',

    neptuneUsdt: {
      apy: 'APY',
      here: 'here',
      submit: 'Submit',
      deposit: 'Deposit',
      neptune: 'Neptune',
      withdraw: 'Withdraw',
      available: 'Available',
      deposited: 'Deposited',
      total: 'Total/Value (USD)',
      availableUSDT: 'Available USDT',
      depositToNeptune: 'Deposit to Neptune',
      automatedYields: 'Helix Automated Yields',
      withdrawFromNeptune: 'Withdraw from Neptune',
      disabled: 'This feature is disabled with auto-sign is activated.',
      availableUsdt: '≈{peggyUsdt} USDT + {neptuneUsdt} Neptune USDT',
      apyTooltip:
        'This is the APY currently offered by Neptune on USDT deposits. This amount will change over time.',
      description:
        'Deposit stablecoins into the USDT lending pool on {link} to automatically earn yield without leaving Helix. When you’re ready to make a trade, funds are automatically withdrawn from the lending pool with no extra steps.',
      percentageInReserve: '(15% in reserve)',
      success: {
        deposit: 'Neptune Deposit Successful',
        withdraw: 'Neptune Withdrawal Succesful'
      },
      termsAndConditions: 'Terms and Conditions',

      warningText:
        'By proceeding, you will be depositing funds in an application not controlled by or affiliated with Injective. Your use of this application is entirely at your own risk and you agree to hold Injective harmless for any losses you may suffer as a result. Please see the Helix {terms} for full details.',
      banner:
        'Helix has partnered with Neptune to make it easy for you to earn yield on your stablecoins without leaving the application. Click {here} to get started!'
    },

    balanceTitle: 'Available',

    tradeToast: {
      bought:
        "{{quantity:{quantity}-{quantityDecimals}}} {symbol} bought at average price {'$'}{{usdPrice:{usdPrice}-{usdPriceDecimals}}}",
      sold: "{{quantity:{quantity}-{quantityDecimals}}} {symbol} sold at average price {'$'}{{usdPrice:{usdPrice}-{usdPriceDecimals}}}"
    },

    iAssetModal: {
      title: 'Unlock the Power of iAssets!',
      description:
        "Be one of the first to trade onchain stock futures with 25x leverage, only on the world's premier decentralized exchange.",
      cta: 'Start Trading'
    }
  }
}
