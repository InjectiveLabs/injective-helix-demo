export default {
  account: {
    accountOverview: 'Account Overview',
    netWorth: 'Net Worth',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
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
        totalBalance: 'Total balance',
        availableBalance: 'Available balance',
        inUseReserved: 'In Use/Reserved',
        value: 'Value ({symbol})'
      }
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
    }
  }
}
