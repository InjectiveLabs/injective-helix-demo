import { MarketsTableColumn, MarketsSelectorTableColumn } from '@/types'

export default {
  trade: {
    tp: 'TP',
    sl: 'SL',
    fee: 'Fee',
    buy: 'Buy',
    max: 'Max',
    size: 'Size',
    info: 'Info',
    long: 'Long',
    sell: 'Sell',
    spot: 'Spot',
    time: 'Time',
    open: 'Open',
    sold: 'Sold',
    tpSl: 'TP/SL',
    chase: 'Chase',
    price: 'Price',
    total: 'Total',
    limit: 'Limit',
    short: 'Short',
    chart: 'Chart',
    depth: 'Depth',
    trade: 'Trade',
    amount: 'Amount',
    filled: 'Filled',
    market: 'Market',
    trades: 'Trades',
    margin: 'Margin',
    volume: 'Volume',
    bought: 'Bought',
    markets: 'Markets',
    details: 'Details',
    quantity: 'Quantity',
    leverage: 'Leverage',
    standard: 'Standard',
    addTpSl: 'Add TP/SL',
    tickSize: 'Tick Size',
    stopLoss: 'Stop Loss',
    postOnly: 'Post Only',
    noTrades: 'No trades',
    noOrders: 'No orders',
    notAvailableNA: 'N/A',
    sharePnl: 'Share PNL',
    avgPrice: 'Avg. Price',
    direction: 'Direction',
    orderbook: 'Orderbook',
    editTpSl: 'Edit TP/SL',
    triggered: 'Triggered',
    cancelled: 'Cancelled',
    markPrice: 'Mark Price',
    cancelAll: 'Cancel All',
    addMargin: 'Add Margin',
    viewOrder: 'View Order',
    'pro-chart': 'Pro Chart',
    allMarkets: 'All Markets',
    marketName: 'Market Name',
    takeProfit: 'Take Profit',
    limitPrice: 'Limit Price',
    worstPrice: 'Worst Price',
    entryPrice: 'Entry Price',
    reduceOnly: 'Reduce Only',
    profitLoss: 'Profit/Loss',
    balanceTitle: 'Available',
    openOrders: 'Open Orders',
    reduce_only: 'Reduce-Only',
    'stop-limit': 'Stop-Limit',
    derivatives: 'Derivatives',
    liquidation: 'Liquidation',
    tickerOnly: '{ticker} only',
    cancelOrder: 'Cancel Order',
    showHistory: 'Show History',
    makerRate: 'Maker Fee Rate',
    maxLeverage: 'Max. Leverage',
    'stop-market': 'Stop-Market',
    confirmTpSl: 'Confirm TP/SL',
    triggerPrice: 'Trigger Price',
    averagePrice: 'Average Price',
    'trading-bots': 'Trading Bots',
    emptyOrders: 'No orders found',
    emptyTrades: 'No trades found',
    noOpenOrders: 'No Open Orders',
    totalNotional: 'Total Notional',
    closePosition: 'Close Position',
    estFeeRebate: 'Est. Fee Rebate',
    partialFilled: 'Partial Filled',
    proceedAnyway: 'Proceed Anyway',
    stopLossLimit: 'Stop-Loss Limit',
    searchMarket: 'Search Market...',
    boostedMarkets: 'Market Rewards',
    priceDeviation: 'Price Deviation',
    noOrderHistory: 'No Order History',
    noTradeHistory: 'No Trade History',
    pnlPercent: 'PnL% (Open Position)',
    stopLossMarket: 'Stop-Loss Market',
    cancelStopLoss: 'Cancel Stop Loss',
    availableMargin: 'Available Margin',
    partiallyFilled: 'Partially Filled',
    noOpenPositions: 'No Open Positions',
    cancelAllOrders: 'Cancel all orders',
    takeProfitLimit: 'Take-Profit Limit',
    enterYourAmount: 'Enter your amount',
    advancedSettings: 'Advanced Settings',
    totalVolume: 'Total Volume ({symbol})',
    stopLossQuantity: 'Stop Loss Quantity',
    takeProfitMarket: 'Take-Profit Market',
    cancelTakeProfit: 'Cancel Take Profit',
    availableAmount: 'Available: {amount}',
    makerTakerRate: 'Maker/Taker Fee Rate',
    slippageTolerance: 'Slippage Tolerance',
    previousMarkPrice: 'Previous Mark Price',
    totalQuantitySize: 'Total Quantity Size',
    marketsInformation: 'Markets Information',
    minLimitOrderSize: 'Min. Limit Order Size',
    bypassPriceWarning: 'Bypass Price Warning',
    totalQuantity: 'Total Quantity ({symbol})',
    takeProfitQuantity: 'Take Profit Quantity',
    disqualifiedMarkets: 'Disqualified Markets',
    estLiquidationPrice: 'Est. Liquidation Price',
    stopLossTriggerPrice: 'Stop Loss Trigger Price',
    emptyAdvancedOrders: 'No Advanced Orders Found',
    takeProfitTriggerPrice: 'Take Profit Trigger Price',
    modifyTakeProfitStopLoss: 'Modify Take Profit / Stop Loss',
    postOnlyWarning: 'Temporarily post-only due to chain upgrade',
    minNotionalError: 'Minimum order value > {minNotional} {symbol}',
    doNotShowThisConfirmationAgain: 'Do not show this confirmation again',
    availableMarginTooltip: 'The available margin you can add to this position',
    thereAreNoDisqualifiedMarketsOnThisRelayer:
      'There are no disqualified markets on this relayer.',
    tensMultiplierRounded:
      'Automatically rounded down to the nearest multiple of {minTickSize}',
    markPriceInvalid:
      'Please modify price, amount, or leverage to meet mark price requirement',
    eip712Warning:
      'Due to extremely high usage, gas-free transactions are currently unavailable',
    slippageTooltip:
      'Slippage tolerance is the maximum price change allowed before a trade is canceled.',
    stopLossDetails:
      'When Mark Price reaches {price}, it will trigger a Stop Loss Market order for {quantity}.',
    takeProfitDetails:
      'When Mark Price reaches {price}, it will trigger a Take Profit Market order for {quantity}.',
    slippageWarning:
      'Your transaction might be executed at a less desirable price if slippage % is set too high.',
    positionUsedTooltip:
      '{quantity} is being used for another order. You can cancel or modify any of your open orders.',
    disqualifiedMarketsTooltip:
      'Markets that are disqualified from Trade & Earn. Trading activity in these markets will not earn any reward points.',
    worstPriceTooltip:
      "The worst price reflects the highest you'll pay when buying or the lowest you'll receive when selling, according to slippage tolerance.",
    chaseTooltip:
      'Click Chase to automatically modify this open limit order to the current best bid/ask price. You must have auto-sign enabled to use this feature.',
    boostedMarketsTooltip:
      'The reward rate for taker and maker orders in each market. For example: 3x maker pts means that trading fees paid by maker orders in this market will receive reward points equal to 3 times the value of trading fees.',

    tab: {
      orders: 'Orders',
      balances: 'Balances',
      positions: 'Positions',
      openOrders: 'Open Orders',
      orderHistory: 'Order History',
      tradeHistory: 'Trade History',
      advancedOrders: 'Advanced Orders',
      fundingHistory: 'Funding History',
      activeStrategies: 'Active strategies',
      removedStrategies: 'Removed strategies'
    },
    rwa: {
      closed: 'Closed',
      nyseClosedTimes: 'NYSE trading hours',
      statusOfThisMarket: 'Status of this market',
      rwaClosedTimes: ' traditional RWA price feeds',
      nyseClosedMarketRow: 'This market follows NYSE trading hours.',
      thisMayIncreaseYourTradingRisk: 'This may increase your trading risk.',
      rwaClosedMarketRow: 'This market follows traditional RWA price feeds.',
      acknowledge:
        'I understand, I accept the risk, and I wish to proceed with my trade.',
      tradesCanBePlace:
        'Trades can be placed outside of these times, but prices will not update until the market reopens.',
      nyseMarketClosedTrade:
        'All markets on Helix can be traded 24/7. It should be noted that this market follows {nyseClosedTimes}, 2:30pm UTC through 9pm UTC, closing on nights, weekends, and NYSE trading holidays.',
      marketClosedTrade:
        'All markets on Helix can be traded 24/7. It should be noted that this market follows {marketClosedTimes}. Markets are closed between 5pm (ET) Friday and 5pm (ET) Sunday, on CME trading holidays, and between 5pm (ET) and 6pm (ET) Monday to Thursday.'
    },
    stats: {
      low: '24h Low',
      high: '24h High',
      usdValue: 'USD Value',
      marketCap: 'Market Cap',
      annualized: 'Annualized',
      nextFunding: 'Next Funding',
      volumeInUsd: 'Volume USD (24h)',
      marketVolume24h: 'Volume (24h)',
      estFundingRate: 'Est. Funding Rate',
      // openInterest: 'Open Interest (USDT)',

      marketCapTooltip:
        'The market cap is calculated by multiplying the current price by the current circulating supply. Some tokens on Injective have an infinite maximum supply.',
      fundingRateTooltip:
        'Funding payments are based on the difference between the perpetual price and the spot price. If the rate is positive, longs pay shorts. If negative, shorts pay longs.',
      markPriceTooltip:
        'Used for margining, computing unrealised PNL and funding rates, liquidations, and TP/SL orders.'
    },

    marketMultiplierBanner: {
      description:
        "This market offers {multiplier}x multipliers for 'Like a G' competition entries starting {startDate} for {duration} hours. Multipliers will be reflected on the leaderboard at a later time. {terms} apply."
    },

    equity: {
      spot: 'Spot',
      perps: 'Perps',
      title: 'Account Equity',
      unrealizedPnl: 'Unrealized PnL'
    },

    neptuneUsdt: {
      apy: 'APY',
      submit: 'Submit',
      deposit: 'Deposit',
      neptune: 'Neptune',
      withdraw: 'Withdraw',
      available: 'Available',
      deposited: 'Deposited',
      availableUSDT: 'Available USDT',
      depositToNeptune: 'Deposit to Neptune',
      percentageInReserve: '(15% in reserve)',
      automatedYields: 'Helix Automated Yields',
      withdrawFromNeptune: 'Withdraw from Neptune',
      availableUsdt: '≈{peggyUsdt} USDT + {neptuneUsdt} Neptune USDT',
      apyTooltip:
        'This is the APY currently offered by Neptune on USDT deposits. This amount will change over time.',
      banner:
        'Helix has partnered with Neptune to make it easy for you to earn yield on your stablecoins without leaving the application. Click {here} to get started!',
      description:
        'Deposit stablecoins into the USDT lending pool on {link} to automatically earn yield without leaving Helix. When you’re ready to make a trade, funds are automatically withdrawn from the lending pool with no extra steps.',
      warningText:
        'By proceeding, you will be depositing funds in an application not controlled by or affiliated with Injective. Your use of this application is entirely at your own risk and you agree to hold Injective harmless for any losses you may suffer as a result. Please see the Helix {terms} for full details.'
    },

    iAssetModal: {
      cta: 'Start Trading',
      title: 'Unlock the Power of iAssets!',
      description:
        "Be one of the first to trade onchain stock futures with 25x leverage, only on the world's premier decentralized exchange."
    },

    marketRestricted: {
      tradeSpot: 'Trade Spot',
      cta: 'Return to homepage',
      swapCta: '{symbol} is not available in your region.',
      title: {
        spot: '{symbol} Restricted',
        perpetual: 'Futures Trading Restricted'
      },
      description: {
        spot: '{symbol} is not available in your region due to regulatory restrictions.',
        perpetual:
          'Futures contracts are not available in your region due to regulatory restrictions. However, you can still trade spot markets.'
      }
    },

    marketNotOnHelix: {
      cta: 'I Understand',
      title: 'Experimental market',
      termsAndCondition: 'Terms and Conditions',
      description:
        'You are accessing a market available on Injective but not listed on Helix. Please check whether the Market ID is the one you would like to trade.',
      description2:
        'By proceeding, you acknowledge that you have read, that you agree to, and that you are bound by the Helix {0} as to any use you make of Helix'
    },

    sharePnlModal: {
      markPrice: 'Mark price',
      entryPrice: 'Entry price',
      mobileDownloadNote: 'Download is available on desktop'
    },

    partialClosePositionModal: {
      limitClose: 'Limit Close',
      marketClose: 'Market Close',
      marketTitle: 'Partial close position',
      totalPositionSize: 'Total position size'
    },

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
        [MarketsSelectorTableColumn.MarketVolume24h]: 'Volume (24h)',
        [MarketsSelectorTableColumn.MarketChange24h]: 'Change (24h)',
        [MarketsSelectorTableColumn.FundingRate]: 'Est. Funding (1h)'
        // [MarketsSelectorTableColumn.OpenInterest]: 'Open Interest'
      }
    }
  }
}
