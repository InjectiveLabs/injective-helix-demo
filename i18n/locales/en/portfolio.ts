import {
  PortfolioChartType,
  PositionTableColumn,
  HistoricalPortfolioDuration,
  PortfolioSubaccountsTableColumn,
  PortfolioSpotOpenOrdersTableColumn,
  PortfolioFuturesAdvancedOrdersTableColumn,
  PortfolioSpotOrderHistoryTableColumn,
  PortfolioSpotTradeHistoryTableColumn,
  PortfolioFuturesOpenOrdersTableColumn,
  PortfolioFuturesOrderHistoryTableColumn,
  PortfolioFuturesTradeHistoryTableColumn
} from './../../../types'

export default {
  portfolio: {
    table: {
      subaccounts: {
        [PortfolioSubaccountsTableColumn.Name]: 'Subaccount Name',
        [PortfolioSubaccountsTableColumn.Address]: 'Subaccount Address',
        [PortfolioSubaccountsTableColumn.TotalUsd]: 'Total Value (USD)'
      },
      spotOpenOrder: {
        [PortfolioSpotOpenOrdersTableColumn.Market]: 'Market',
        [PortfolioSpotOpenOrdersTableColumn.Side]: 'Side',
        [PortfolioSpotOpenOrdersTableColumn.Price]: 'Price',
        [PortfolioSpotOpenOrdersTableColumn.Amount]: 'Amount',
        [PortfolioSpotOpenOrdersTableColumn.Unfilled]: 'Unfilled',
        [PortfolioSpotOpenOrdersTableColumn.Filled]: 'Filled',
        [PortfolioSpotOpenOrdersTableColumn.TotalAmount]: 'Total Amount',
        [PortfolioSpotOpenOrdersTableColumn.Chase]: 'Chase',
        [PortfolioSpotOpenOrdersTableColumn.Action]: 'Action'
      },
      spotOrderHistory: {
        [PortfolioSpotOrderHistoryTableColumn.LastUpdated]: 'Last Updated',
        [PortfolioSpotOrderHistoryTableColumn.Market]: 'Market',
        [PortfolioSpotOrderHistoryTableColumn.Type]: 'Type',
        [PortfolioSpotOrderHistoryTableColumn.Side]: 'Side',
        [PortfolioSpotOrderHistoryTableColumn.Price]: 'Price',
        [PortfolioSpotOrderHistoryTableColumn.Amount]: 'Amount',
        [PortfolioSpotOrderHistoryTableColumn.Total]: 'Total',
        [PortfolioSpotOrderHistoryTableColumn.TriggerCondition]:
          'Trigger Condition',
        [PortfolioSpotOrderHistoryTableColumn.Status]: 'Status'
      },
      spotTradeHistory: {
        [PortfolioSpotTradeHistoryTableColumn.Time]: 'Time',
        [PortfolioSpotTradeHistoryTableColumn.Pair]: 'Pair',
        [PortfolioSpotTradeHistoryTableColumn.Type]: 'Type',
        [PortfolioSpotTradeHistoryTableColumn.Side]: 'Side',
        [PortfolioSpotTradeHistoryTableColumn.Price]: 'Price',
        [PortfolioSpotTradeHistoryTableColumn.Amount]: 'Amount',
        [PortfolioSpotTradeHistoryTableColumn.Fee]: 'Fee',
        [PortfolioSpotTradeHistoryTableColumn.Total]: 'Total'
      },
      futuresOpenOrder: {
        [PortfolioFuturesOpenOrdersTableColumn.Market]: 'Market',
        [PortfolioFuturesOpenOrdersTableColumn.Side]: 'Side',
        [PortfolioFuturesOpenOrdersTableColumn.Price]: 'Price',
        [PortfolioFuturesOpenOrdersTableColumn.Amount]: 'Amount',
        [PortfolioFuturesOpenOrdersTableColumn.Unfilled]: 'Unfilled',
        [PortfolioFuturesOpenOrdersTableColumn.Filled]: 'Filled',
        [PortfolioFuturesOpenOrdersTableColumn.Leverage]: 'Leverage',
        [PortfolioFuturesOpenOrdersTableColumn.Total]: 'Total',
        [PortfolioFuturesOpenOrdersTableColumn.Chase]: 'Chase',
        [PortfolioFuturesOpenOrdersTableColumn.Action]: 'Action'
      },
      futuresAdvancedOrders: {
        [PortfolioFuturesAdvancedOrdersTableColumn.Market]: 'Market',
        [PortfolioFuturesAdvancedOrdersTableColumn.Type]: 'Type',
        [PortfolioFuturesAdvancedOrdersTableColumn.Side]: 'Side',
        [PortfolioFuturesAdvancedOrdersTableColumn.Price]: 'Price',
        [PortfolioFuturesAdvancedOrdersTableColumn.Amount]: 'Amount',
        [PortfolioFuturesAdvancedOrdersTableColumn.Leverage]: 'Leverage',
        [PortfolioFuturesAdvancedOrdersTableColumn.Total]: 'Total',
        [PortfolioFuturesAdvancedOrdersTableColumn.TriggerCondition]:
          'Trigger Condition',
        [PortfolioFuturesAdvancedOrdersTableColumn.Action]: 'Action'
      },
      futuresOrderHistory: {
        [PortfolioFuturesOrderHistoryTableColumn.LastUpdated]: 'Last Updated',
        [PortfolioFuturesOrderHistoryTableColumn.Market]: 'Market',
        [PortfolioFuturesOrderHistoryTableColumn.Type]: 'Type',
        [PortfolioFuturesOrderHistoryTableColumn.Side]: 'Side',
        [PortfolioFuturesOrderHistoryTableColumn.Price]: 'Price',
        [PortfolioFuturesOrderHistoryTableColumn.Amount]: 'Amount',
        [PortfolioFuturesOrderHistoryTableColumn.Total]: 'Total',
        [PortfolioFuturesOrderHistoryTableColumn.TriggerCondition]:
          'Trigger Condition',
        [PortfolioFuturesOrderHistoryTableColumn.Status]: 'Status'
      },
      futuresTradeHistory: {
        [PortfolioFuturesTradeHistoryTableColumn.Time]: 'Time',
        [PortfolioFuturesTradeHistoryTableColumn.Market]: 'Market',
        [PortfolioFuturesTradeHistoryTableColumn.Type]: 'Type',
        [PortfolioFuturesTradeHistoryTableColumn.Side]: 'Side',
        [PortfolioFuturesTradeHistoryTableColumn.Price]: 'Price',
        [PortfolioFuturesTradeHistoryTableColumn.Amount]: 'Amount',
        [PortfolioFuturesTradeHistoryTableColumn.Fee]: 'Fee',
        [PortfolioFuturesTradeHistoryTableColumn.Total]: 'Total'
      },
      position: {
        [PositionTableColumn.Market]: 'Market',
        [PositionTableColumn.Side]: 'Side',
        [PositionTableColumn.Contracts]: 'Contracts',
        [PositionTableColumn.Entry]: 'Entry Price',
        [PositionTableColumn.Mark]: 'Mark Price',
        [PositionTableColumn.UnrealizedPnl]: 'Unrealized PNL',
        [PositionTableColumn.TotalUsd]: 'Total Value (USD)',
        [PositionTableColumn.Margin]: 'Position Margin',
        [PositionTableColumn.LiquidationPrice]: 'Liq. Price',
        [PositionTableColumn.Leverage]: 'Leverage',
        [PositionTableColumn.TpOrSl]: 'TP/SL',
        [PositionTableColumn.ClosePosition]: 'Close Position'
      }
    },
    value: 'Portfolio Value',
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',

    home: {
      [PortfolioChartType.Volume]: {
        title: 'Trade Volume (Weekly)'
      },
      [PortfolioChartType.Balance]: {
        title: 'Portfolio Value'
      },
      [PortfolioChartType.TradableBalance]: {
        title: 'Tradable Value'
      },
      [PortfolioChartType.Pnl]: {
        title: 'Trading PnL',
        tooltip:
          'The profit and loss calculations on the portfolio page reflect the approximate realized profit and loss from positions opened and closed on Helix since May 29, 2024. This calculation  is purely for illustrative purposes and should not be used for any tax reporting obligations.'
      },
      stakedInj: 'Staked INJ',
      yieldBearingUsdt: 'Yield Bearing USDT',
      unrealizedPositions: 'Unrealized Positions'
    },

    balances: {
      netWorth: 'Net Worth',
      available: 'Available',
      inUseReserved: 'In Use/Reserved',
      unrealizedPnl: 'Unrealized PnL',
      total: 'Total',
      totalValueUsd: 'Total Value (USD)',
      transferToMain: 'Transfer to Main'
    },

    subaccounts: {
      name: 'Subaccount Name',
      address: 'Subaccount Address',
      totalValue: 'Total Value (USD)',
      description:
        'This is a secondary account linked to your main account for separate management and trading of digital assets. To activate it, you first need to transfer funds. Learn more about subaccounts in our FAQ.',
      addSubaccount: 'Add Subaccount',
      addSubaccountOrTransfer: 'Add Subaccount / Transfer'
    },

    history: {
      wallet: {
        noHistory: 'No transfers found'
      }
    },

    settings: {
      title: 'Settings',
      account: 'Account',

      preferences: {
        title: 'Preferences',
        description: 'Customize your trading experience',

        eip712: {
          title: 'Enable EIP-712 Signing'
        },
        autosign: {
          title: 'Auto Sign',
          description:
            'Auto-sign allows you to trade without needing to manually approve each transaction in your wallet',
          tooltip:
            "Once activated, you won't need to sign each transaction for up to 3 days, and you can switch it back at any time."
        },
        thousandsSeparator: {
          title: 'Thousands Separator',
          description:
            'Adds commas to large numbers for easier reading. Example: 1234567 to 1,234,567'
        },
        gridTradingSubaccounts: {
          title: 'Show Grid Trading Subaccounts',
          description: 'Display a list of subaccounts dedicated to grid trading'
        }
      }
    },

    filters: {
      cleanFilters: 'Clean Filters',
      filterBySide: 'Filter by Side'
    },
    connectMobile: {
      scanQRCode: 'Scan this QR code on mobile to connect your wallet',
      grantAccess: 'Grant Access',
      scanCode: 'Scan Code to Continue'
    },

    bankTransfer: {
      title: 'Transfer',
      enterAddress: 'Enter Injective Address',
      memo: {
        title: 'Memo',
        required: 'Required',
        placeholder: 'Enter memo (required for most centralized exchanges)'
      },
      doubleCheck:
        'Please check the address. Tokens sent to a wrong address cannot be recovered.'
    },

    duration: {
      [HistoricalPortfolioDuration.OneDay]: '1D',
      [HistoricalPortfolioDuration.OneWeek]: '1W',
      [HistoricalPortfolioDuration.OneMonth]: '1M'
    }
  }
}
