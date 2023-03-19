export default {
  account: {
    accountOverview: 'Account Overview',
    available: 'Available',
    convertUsdc: 'Convert USDC',
    fee: 'Fee',
    netWorth: 'Net Worth',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transfer: 'Transfer',
    trade: 'Trade',
    filters: 'Filters',
    filterByAsset: 'Filter by asset',
    showMarginCurrencyOnly: 'Show margin currency only',
    hideSmallBalances: 'Hide small balances',
    hideSmallBalancesTooltip:
      'Assets valued below 10 USD are classified as small balances',
    tabs: {
      balances: 'Balances',
      positions: 'Positions',
      orders: 'Orders'
    },
    balances: {
      empty: 'No balances found',
      cols: {
        asset: 'Asset',
        total: 'Total',
        walletBalance: 'Wallet balance',
        tradingAccountBalance: 'Trading balance',
        totalBalance: 'Total',
        availableBalance: 'Available',
        inUseReserved: 'In Use/Reserved',
        unrealized: 'Unrealized PnL',
        value: 'Value ({symbol})'
      },
      inUseReservedTooltip: 'Sum of in order amount and margin held',
      unrealizedTooltip:
        'Total margin and unrealized PnL from your open positions'
    },
    positions: {
      empty: 'No positions found',
      closeAllPositions: 'Close all positions',
      closePosition: 'Close position',
      market: {
        label: 'Market',
        all: 'All'
      },
      side: {
        label: 'Side',
        all: 'All',
        short: 'Short',
        long: 'Long'
      },
      cols: {
        market: 'Market',
        side: 'Side',
        quantity: 'Quantity',
        entryMark: 'Entry / Mark',
        entryPrice: 'Entry Price',
        markPrice: 'Mark Price',
        estLiquidationPrice: 'Est. Liquidation Price',
        unrealizedPnl: 'Unrealized PNL',
        total: 'Total',
        margin: 'Margin',
        leverage: 'Leverage'
      }
    },
    assetDetails: {
      title: 'Asset details',
      trade: 'Trade',
      emptyMarkets: 'No markets available for trading.'
    },
    usdcPeggyToken: 'Injective Bridge from Ethereum',
    usdcWHEthereumToken: 'Wormhole from Ethereum',
    usdcWHSolanaToken: 'Wormhole from Solana',
    whyConvert:
      'Why convert? The USDC bridged from Ethereum using the Injective bridge is not the most widely adopted USD Coin on Injective, in terms of available markets. You will need to convert it to the USDCet to trade on Injective.',
    from: 'FROM',
    to: 'TO',
    injectiveBridge: 'Injective Bridge',
    wormhole: 'Wormhole (Ethereum)',
    solana: 'Wormhole (Solana)',

    balanceBreakdownExplorer: 'Your full balance breakdown can be found on the',
    explorer: 'explorer',
    default: 'Default',
    account: 'Subaccount',
    accountBalance: 'Subccount Balance'
  }
}
