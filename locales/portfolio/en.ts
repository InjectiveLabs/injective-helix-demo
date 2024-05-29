import { PortfolioChartType } from '@/types'

export default {
  portfolio: {
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',
    value: 'Portfolio Value',

    home: {
      [PortfolioChartType.Balance]: {
        title: 'Portfolio Value'
      },
      [PortfolioChartType.Pnl]: {
        title: '30-day Trading PnL',
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
      totalValueUsd: 'Total Value (USD)'
    },

    subaccounts: {
      name: 'Subaccount Name',
      address: 'Subaccount Address',
      totalValue: 'Total Value (USD)',
      description:
        'This is a secondary account linked to your main account for separate management and trading of digital assets. To activate it, you first need to transfer funds. Learn more about subaccounts in our FAQ.',
      addSubaccount: 'Add Subaccount'
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
        granter: 'Granter',
        addNewGrantee: 'Add new grantee address',
        noGrants: 'No grants found'
      },

      preferences: {
        title: 'Preferences',
        description: 'Customize your trading experience'
      },

      autoSign: {
        title: 'Auto-Sign',
        description: 'Automatically sign transactions',
        howItWorks:
          'During the specified duration, you can perform many operations on Helix without the need to sign an additional transaction. This includes opening and closing positions on spot and perp trading pairs, setting limit orders, and creating TP/SL parameters. It does not include interactions with the swap feature or trading bots. For security reasons, the auto sign function will expire after the selected time frame, at which point you may choose to initiate a new session.',
        enable: 'Enable Auto-Sign',
        disconnect: 'Disconnect Auto-Sign'
      }
    },

    filters: {
      cleanFilters: 'Clean Filters',
      filterBySide: 'Filter by Side'
    }
  }
}
