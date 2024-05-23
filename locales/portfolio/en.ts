export default {
  portfolio: {
    assetsFrom: 'Assets From',
    totalValue: 'Total Value',
    value: 'Portfolio Value',

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
      totalValue: 'Total Value (USD)'
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
    }
  }
}
