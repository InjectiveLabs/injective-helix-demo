import {
  BalanceTableColumn,
  PortfolioChartType,
  PositionTableColumn,
  HistorySwapTableColumn,
  HistoryWalletTableColumn,
  FundingHistoryTableColumn,
  HistoricalPortfolioDuration,
  PortfolioSubaccountsTableColumn,
  PortfolioSpotOpenOrdersTableColumn,
  PortfolioSpotOrderHistoryTableColumn,
  PortfolioSpotTradeHistoryTableColumn,
  PortfolioFuturesOpenOrdersTableColumn,
  PortfolioFuturesTradeHistoryTableColumn,
  PortfolioFuturesOrderHistoryTableColumn,
  PortfolioFuturesAdvancedOrdersTableColumn
} from '@/types'

export default {
  portfolio: {
    swaps: 'Swaps',
    staked: 'Staked',
    positions: 'Positions',
    spotOrders: 'Spot Orders',
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',
    tradeHistory: 'Trade History',
    orderHistory: 'Order History',
    noOpenOrders: 'No Open Orders',
    fundingHistory: 'Funding History',
    advancedOrders: 'Advanced Orders',
    noPositionsOpen: 'No Positions Open',
    derivativeOrders: 'Derivative Orders',
    noTransferHistory: 'No transfers found',
    noFundingHistory: 'No funding history found',
    showUnverifiedAssets: 'Show unverified assets',
    notAvailableinAuthZOrAutoSignMode:
      'Not available in Access Control Mode or Auto-Sign Mode',

    tab: {
      pnl: 'PNL',
      account: 'Account'
    },

    home: {
      stakedInj: 'Staked INJ',
      yieldBearingUsdt: 'Yield Bearing USDT',
      unrealizedPositions: 'Unrealized Positions',
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
      }
    },

    balances: {
      netWorth: 'Net Worth',
      transferToMain: 'Transfer to Main'
    },

    subaccounts: {
      addSubaccountOrTransfer: 'Add Subaccount / Transfer',
      accountEndBot:
        'To transfer funds to your main account, please stop your current Spot Grid Trading Bot. This action will automatically initiate the transfer of your funds.',
      description:
        'This is a secondary account linked to your main account for separate management and trading of digital assets. To activate it, you first need to transfer funds. Learn more about subaccounts in our FAQ.'
    },

    settings: {
      title: 'Settings',
      account: 'Account',
      notAvailableinAuthZMode: 'Not available in Access Control Mode',

      preferences: {
        title: 'Preferences',
        eip712: {
          title: 'Enable EIP-712 Signing'
        },
        autosign: {
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
      byType: 'Filter by Type',
      bySide: 'Filter by Side',
      byAsset: 'Filter by Asset',
      byMarket: 'Filter by Market',
      cleanFilters: 'Clean Filters'
    },

    connectMobile: {
      grantAccess: 'Grant Access',
      scanCode: 'Scan Code to Continue',
      scanQRCode: 'Scan this QR code on mobile to connect your wallet'
    },

    bankTransfer: {
      title: 'Transfer',
      enterAddress: 'Enter Injective Address',
      doubleCheck:
        'Please check the address. Tokens sent to a wrong address cannot be recovered.',
      memo: {
        title: 'Memo',
        required: 'Required',
        placeholder: 'Enter memo (required for most centralized exchanges)'
      }
    },

    duration: {
      [HistoricalPortfolioDuration.OneDay]: '1D',
      [HistoricalPortfolioDuration.OneWeek]: '1W',
      [HistoricalPortfolioDuration.OneMonth]: '1M'
    },

    walletHistory: {
      subaccountDepositType: 'Wallet to Subaccount',
      subaccountWithdrawalType: 'Subaccount to Wallet',
      subaccountInternalTransferType: 'Subaccount to Subaccount'
    },

    keyStats: {
      title: 'Key Stats',
      allTimePnl: 'All-time PNL',
      totalVolume: 'Total Volume',
      totalEquity: 'Total Equity',
      stakingAccount: 'Staking Account',
      spotAccountEquity: 'Spot Account Equity',
      perpsAccountEquity: 'Perps Account Equity'
    },

    authZ: {
      title: 'Access Control Management',
      description:
        'Grant other wallet address full/partial permissions to make trades on their behalf',
      revoke: 'Revoke',
      actions: 'Actions',
      grantee: 'Grantee',
      granter: 'Granter',
      revokeAll: 'Revoke All',
      connectAs: 'Connect as',
      noGrants: 'No grants found',
      authZAs: 'AuthZ as {address}',
      granteeAddress: 'Grantee Address',
      grantedFunctions: 'Granted Functions',
      connectMobile: 'Connect Mobile Device',
      addNewGrantee: 'Add new grantee address',
      addGranteeAddress: 'Add grantee address',
      viewGrantedFunctions: 'View granted functions',
      notAvailableinAutoSignMode: 'Not available in Auto-Sign Mode'
    },

    autoSign: {
      title: 'Auto Sign',
      durationDescription: 'Auto sign is active for 3 days.',
      pageTitle: 'Auto-Sign: Approve Transactions Automatically',
      content1: {
        description1: 'Once enabled, you can use Helix without signing',
        description2: 'each transaction for up to 3 days.'
      },
      content2: {
        title: 'You can use it for:',
        description1: 'Opening/closing positions (spot & perpetual pairs)',
        description2: 'Setting limit orders',
        description3: 'Creating Take-Profit / Stop-Loss (TP/SL) orders'
      },
      content3: {
        title: 'Note:',
        description1: 'Swap and trading bots are not included.',
        description2:
          'For security, the session automatically expires after 3 days.',
        description3: 'You can start a new session anytime after it ends.'
      },
      expiredToast: {
        settings: 'Settings',
        title: 'Auto sign session has expired',
        description: 'You can start a new session from {settings}'
      }
    },

    table: {
      fundingHistory: {
        [FundingHistoryTableColumn.Time]: 'Time',
        [FundingHistoryTableColumn.Pair]: 'Pair',
        [FundingHistoryTableColumn.Payment]: 'Payment'
      },
      subaccounts: {
        [PortfolioSubaccountsTableColumn.Name]: 'Subaccount Name',
        [PortfolioSubaccountsTableColumn.Address]: 'Subaccount Address',
        [PortfolioSubaccountsTableColumn.TotalUsd]: 'Total Value (USD)'
      },
      historySwap: {
        [HistorySwapTableColumn.Fee]: 'Fee',
        [HistorySwapTableColumn.Time]: 'Time',
        [HistorySwapTableColumn.Route]: 'Route',
        [HistorySwapTableColumn.Outgoing]: 'Outgoing',
        [HistorySwapTableColumn.Incoming]: 'Incoming'
      },
      historyWallet: {
        [HistoryWalletTableColumn.Time]: 'Time',
        [HistoryWalletTableColumn.Type]: 'Type',
        [HistoryWalletTableColumn.Asset]: 'Asset',
        [HistoryWalletTableColumn.Amount]: 'Amount',
        [HistoryWalletTableColumn.Origin]: 'Origin',
        [HistoryWalletTableColumn.Destination]: 'Destination'
      },
      balance: {
        [BalanceTableColumn.Total]: 'Total',
        [BalanceTableColumn.Assets]: 'Assets',
        [BalanceTableColumn.Staked]: 'Staked',
        [BalanceTableColumn.Available]: 'Available',
        [BalanceTableColumn.StakedUsd]: 'Staked (USD)',
        [BalanceTableColumn.TotalUsd]: 'Total Value (USD)',
        [BalanceTableColumn.UnrealizedPnl]: 'Unrealized PnL',
        [BalanceTableColumn.UsedOrReserved]: 'In Use/Reserved'
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
    }
  }
}
