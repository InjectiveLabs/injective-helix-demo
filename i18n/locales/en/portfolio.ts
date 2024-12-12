import {
  PortfolioChartType,
  PositionTableColumn,
  I18nMessageFunction,
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
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',
    value: 'Portfolio Value',

    home: {
      [PortfolioChartType.Balance]: {
        title: 'Portfolio Value'
      },
      [PortfolioChartType.Pnl]: {
        title: 'Trading PnL',
        tooltip:
          'The profit and loss calculations on the portfolio page reflect the approximate realized profit and loss from positions opened and closed on Helix since May 29, 2024. This calculation  is purely for illustrative purposes and should not be used for any tax reporting obligations.'
      },
      [PortfolioChartType.Volume]: {
        title: 'Trade Volume (Weekly)'
      }
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

      authz: {
        title: 'Access Control Manager',
        description:
          'Grant other wallet address full/partial permissions to make trades on their behalf',
        grantee: 'Grantee',
        granteeAddress: 'Grantee Address',
        grantedFunctions: 'Granted Functions',
        actions: 'Actions',
        granter: 'Granter',
        addNewGrantee: 'Add new grantee address',
        addGranteeAddress: 'Add grantee address',
        connectMobile: 'Connect Mobile Device',
        noGrants: 'No grants found',
        viewGrantedFunctions: 'View granted functions',
        connected: 'Connected',
        connectAs: 'Connect as',
        revoke: 'Revoke',
        revokeAll: 'Revoke All'
      },

      preferences: {
        title: 'Preferences',
        description: 'Customize your trading experience',
        thousandsSeparator: 'Thousands Separator',
        showGridTradingSubaccounts: 'Show Grid Trading Subaccounts'
      },

      autoSign: {
        title: 'Auto-Sign',
        description: 'Automatically sign transactions',
        howItWorks:
          'During the enabled duration (1 hour), you can perform many operations on Helix (including opening/closing positions on spot and perp trading pairs, setting limit orders, and creating TP/SL parameters) without signing additional transactions. Interactions with the swap feature or trading bots are not included. For security reasons, the auto sign function will expire after the 1 hour time frame, at which point you may choose to initiate a new session.',
        enable: 'Enable Auto-Sign',
        enabledToast: {
          title: 'Auto sign is enabled',
          description: 'Auto sign is active for 1 hour.'
        },
        disabledToast: {
          title: 'Auto sign is disabled'
        },
        allowsYouToTrade:
          'Allows you to trade for 60 minutes without needing to sign each transaction',
        expiredToast: {
          title: 'Auto sign session has expired',
          settings: 'Settings',
          description: ({ interpolate, named }: I18nMessageFunction) =>
            interpolate([
              'You can start a new session from ',
              named('settings')
            ])
        },
        disconnect: 'Disconnect Auto-Sign'
      }
    },

    filters: {
      cleanFilters: 'Clean Filters',
      filterBySide: 'Filter by Side'
    },
    connectMobile: {
      scanQRCode: 'Scan this QR code in Helix Mobile to connect your wallet!',
      grantAccess: 'Grant Access',
      scanCode: 'Scan Code to Continue'
    },

    bankTransfer: {
      title: 'Transfer',
      successful: 'Transfer Successful',
      enterAddress: 'Enter Injective Address',
      memo: {
        title: 'Memo',
        required: 'Required',
        placeholder: 'Enter memo (required for most centralized exchanges)'
      },
      doubleCheck:
        'Please check the address. Tokens sent to a wrong address cannot be recovered.'
    }
  }
}
