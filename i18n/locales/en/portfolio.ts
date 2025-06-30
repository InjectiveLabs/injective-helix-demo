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
} from '@/types'

export default {
  portfolio: {
    table: {
      subaccounts: {
        [PortfolioSubaccountsTableColumn.Name]: 'Subaccount Name',
        [PortfolioSubaccountsTableColumn.Address]: 'Subaccount Address',
        [PortfolioSubaccountsTableColumn.TotalUsd]: 'Total Value (USD)'
      },
      spotOpenOrder: {
        [PortfolioSpotOpenOrdersTableColumn.Side]: 'Side',
        [PortfolioSpotOpenOrdersTableColumn.Price]: 'Price',
        [PortfolioSpotOpenOrdersTableColumn.Chase]: 'Chase',
        [PortfolioSpotOpenOrdersTableColumn.Action]: 'Action',
        [PortfolioSpotOpenOrdersTableColumn.Market]: 'Market',
        [PortfolioSpotOpenOrdersTableColumn.Amount]: 'Amount',
        [PortfolioSpotOpenOrdersTableColumn.Filled]: 'Filled',
        [PortfolioSpotOpenOrdersTableColumn.Unfilled]: 'Unfilled',
        [PortfolioSpotOpenOrdersTableColumn.TotalAmount]: 'Total Amount'
      },
      spotOrderHistory: {
        [PortfolioSpotOrderHistoryTableColumn.Type]: 'Type',
        [PortfolioSpotOrderHistoryTableColumn.Side]: 'Side',
        [PortfolioSpotOrderHistoryTableColumn.Price]: 'Price',
        [PortfolioSpotOrderHistoryTableColumn.Total]: 'Total',
        [PortfolioSpotOrderHistoryTableColumn.Status]: 'Status',
        [PortfolioSpotOrderHistoryTableColumn.Market]: 'Market',
        [PortfolioSpotOrderHistoryTableColumn.Amount]: 'Amount',
        [PortfolioSpotOrderHistoryTableColumn.LastUpdated]: 'Last Updated',
        [PortfolioSpotOrderHistoryTableColumn.TriggerCondition]:
          'Trigger Condition'
      },
      spotTradeHistory: {
        [PortfolioSpotTradeHistoryTableColumn.Fee]: 'Fee',
        [PortfolioSpotTradeHistoryTableColumn.Time]: 'Time',
        [PortfolioSpotTradeHistoryTableColumn.Pair]: 'Pair',
        [PortfolioSpotTradeHistoryTableColumn.Type]: 'Type',
        [PortfolioSpotTradeHistoryTableColumn.Side]: 'Side',
        [PortfolioSpotTradeHistoryTableColumn.Total]: 'Total',
        [PortfolioSpotTradeHistoryTableColumn.Price]: 'Price',
        [PortfolioSpotTradeHistoryTableColumn.Amount]: 'Amount'
      },
      futuresOpenOrder: {
        [PortfolioFuturesOpenOrdersTableColumn.Side]: 'Side',
        [PortfolioFuturesOpenOrdersTableColumn.Price]: 'Price',
        [PortfolioFuturesOpenOrdersTableColumn.Total]: 'Total',
        [PortfolioFuturesOpenOrdersTableColumn.Chase]: 'Chase',
        [PortfolioFuturesOpenOrdersTableColumn.Action]: 'Action',
        [PortfolioFuturesOpenOrdersTableColumn.Market]: 'Market',
        [PortfolioFuturesOpenOrdersTableColumn.Amount]: 'Amount',
        [PortfolioFuturesOpenOrdersTableColumn.Filled]: 'Filled',
        [PortfolioFuturesOpenOrdersTableColumn.Unfilled]: 'Unfilled',
        [PortfolioFuturesOpenOrdersTableColumn.Leverage]: 'Leverage'
      },
      futuresAdvancedOrders: {
        [PortfolioFuturesAdvancedOrdersTableColumn.Type]: 'Type',
        [PortfolioFuturesAdvancedOrdersTableColumn.Side]: 'Side',
        [PortfolioFuturesAdvancedOrdersTableColumn.Price]: 'Price',
        [PortfolioFuturesAdvancedOrdersTableColumn.Total]: 'Total',
        [PortfolioFuturesAdvancedOrdersTableColumn.Action]: 'Action',
        [PortfolioFuturesAdvancedOrdersTableColumn.Market]: 'Market',
        [PortfolioFuturesAdvancedOrdersTableColumn.Amount]: 'Amount',
        [PortfolioFuturesAdvancedOrdersTableColumn.Leverage]: 'Leverage',
        [PortfolioFuturesAdvancedOrdersTableColumn.TriggerCondition]:
          'Trigger Condition'
      },
      futuresOrderHistory: {
        [PortfolioFuturesOrderHistoryTableColumn.Type]: 'Type',
        [PortfolioFuturesOrderHistoryTableColumn.Side]: 'Side',
        [PortfolioFuturesOrderHistoryTableColumn.Price]: 'Price',
        [PortfolioFuturesOrderHistoryTableColumn.Total]: 'Total',
        [PortfolioFuturesOrderHistoryTableColumn.Status]: 'Status',
        [PortfolioFuturesOrderHistoryTableColumn.Market]: 'Market',
        [PortfolioFuturesOrderHistoryTableColumn.Amount]: 'Amount',
        [PortfolioFuturesOrderHistoryTableColumn.LastUpdated]: 'Last Updated',
        [PortfolioFuturesOrderHistoryTableColumn.TriggerCondition]:
          'Trigger Condition'
      },
      futuresTradeHistory: {
        [PortfolioFuturesTradeHistoryTableColumn.Fee]: 'Fee',
        [PortfolioFuturesTradeHistoryTableColumn.Time]: 'Time',
        [PortfolioFuturesTradeHistoryTableColumn.Type]: 'Type',
        [PortfolioFuturesTradeHistoryTableColumn.Side]: 'Side',
        [PortfolioFuturesTradeHistoryTableColumn.Price]: 'Price',
        [PortfolioFuturesTradeHistoryTableColumn.Total]: 'Total',
        [PortfolioFuturesTradeHistoryTableColumn.Market]: 'Market',
        [PortfolioFuturesTradeHistoryTableColumn.Amount]: 'Amount',
        [PortfolioFuturesTradeHistoryTableColumn.Pnl]: 'Closed PNL'
      },
      position: {
        [PositionTableColumn.Side]: 'Side',
        [PositionTableColumn.TpOrSl]: 'TP/SL',
        [PositionTableColumn.Market]: 'Market',
        [PositionTableColumn.Mark]: 'Mark Price',
        [PositionTableColumn.Entry]: 'Entry Price',
        [PositionTableColumn.Leverage]: 'Leverage',
        [PositionTableColumn.Contracts]: 'Contracts',
        [PositionTableColumn.Margin]: 'Position Margin',
        [PositionTableColumn.TotalUsd]: 'Total Value (USD)',
        [PositionTableColumn.LiquidationPrice]: 'Liq. Price',
        [PositionTableColumn.ClosePosition]: 'Close Position',
        [PositionTableColumn.UnrealizedPnl]: 'Unrealized PNL'
      }
    },
    value: 'Portfolio Value',
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',

    tab: {
      pnl: 'PNL',
      account: 'Account'
    },

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
      total: 'Total',
      netWorth: 'Net Worth',
      available: 'Available',
      unrealizedPnl: 'Unrealized PnL',
      inUseReserved: 'In Use/Reserved',
      transferToMain: 'Transfer to Main',
      totalValueUsd: 'Total Value (USD)'
    },

    subaccounts: {
      name: 'Subaccount Name',
      address: 'Subaccount Address',
      totalValue: 'Total Value (USD)',
      addSubaccount: 'Add Subaccount',
      addSubaccountOrTransfer: 'Add Subaccount / Transfer',
      description:
        'This is a secondary account linked to your main account for separate management and trading of digital assets. To activate it, you first need to transfer funds. Learn more about subaccounts in our FAQ.'
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
      grantAccess: 'Grant Access',
      scanQRCode: 'Scan this QR code on mobile to connect your wallet',
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
    },

    keyStats: {
      title: 'Key Stats',
      allTimePnl: 'All-time PNL',
      totalVolume: 'Total Volume',
      totalEquity: 'Total Equity',
      stakingAccount: 'Staking Account',
      spotAccountEquity: 'Spot Account Equity',
      perpsAccountEquity: 'Perps Account Equity'
    }
  }
}
