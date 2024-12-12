import {
  HistorySwapTableColumn,
  HistoryWalletTableColumn,
  FundingHistoryTableColumn
} from '@/types'

export default {
  activity: {
    table: {
      fundingHistory: {
        [FundingHistoryTableColumn.Time]: 'Time',
        [FundingHistoryTableColumn.Pair]: 'Pair',
        [FundingHistoryTableColumn.Payment]: 'Payment'
      },

      historyWallet: {
        [HistoryWalletTableColumn.Time]: 'Time',
        [HistoryWalletTableColumn.Type]: 'Type',
        [HistoryWalletTableColumn.Asset]: 'Asset',
        [HistoryWalletTableColumn.Amount]: 'Amount',
        [HistoryWalletTableColumn.Origin]: 'Origin',
        [HistoryWalletTableColumn.Destination]: 'Destination'
      },
      historySwap: {
        [HistorySwapTableColumn.Time]: 'Time',
        [HistorySwapTableColumn.Outgoing]: 'Outgoing',
        [HistorySwapTableColumn.Incoming]: 'Incoming',
        [HistorySwapTableColumn.Route]: 'Route',
        [HistorySwapTableColumn.Fee]: 'Fee'
      }
    },
    swaps: 'Swaps',
    funds: 'Funds',
    orders: 'Orders',
    activity: 'Activity',
    advancedOrders: 'Advanced Orders',
    balances: 'Balances',
    spotGrid: 'Spot Grid',
    positions: 'Positions',
    activities: 'Activities',
    spotOrders: 'Spot Orders',
    swapHistory: 'Swap History',
    fetchOrders: 'Fetch Orders',
    fetchTrades: 'Fetch Trades',
    tradeHistory: 'Trade History',
    orderHistory: 'Order History',
    fundingHistory: 'Funding History',
    cancelOrders: 'Cancel Orders',
    rewardHistory: 'Reward History',
    walletHistory: 'Wallet History',
    derivativeOrders: 'Derivative Orders',
    activeStrategies: 'Active strategies',
    removedStrategies: 'Removed strategies',
    common: {
      type: 'Type'
    }
  },

  fundingHistory: {
    emptyFundingHistory: 'No funding history found',
    payment: 'Payment',
    paymentTooltip:
      'A positive payment means you received funding, while a negative payment means you paid funding. Funding is automatically reflected in your open position margin.',
    rate: 'Rate',
    rateTooltip:
      'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.'
  },

  rewardsHistory: {
    emptyTradingRewards: 'No distributed trading rewards found'
  },

  walletHistory: {
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    emptySubaccountTransfers: 'No subaccount transfers found',
    emptyDepositTransactions: 'No deposits found',
    emptyWithdrawalTransactions: 'No withdrawals found',
    subaccountDepositType: 'Wallet to Subaccount',
    subaccountWithdrawalType: 'Subaccount to Wallet',
    subaccountInternalTransferType: 'Subaccount to Subaccount',
    INJTransferType: 'Injective to Injective',
    axelarDepositType: 'Axelar to Injective',
    chihuahuaDepositType: 'Chihuahua to Injective',
    cosmosDepositType: 'Cosmos Hub to Injective',
    ethDepositType: 'Ethereum to Injective',
    evmosDepositType: 'Evmos to Injective',
    junoDepositType: 'Juno to Injective',
    osmosisDepositType: 'Osmosis to Injective',
    terraDepositType: 'Terra to Injective',
    axelarWithdrawalType: 'Injective to Axelar',
    chihuahuaWithdrawalType: 'Injective to Chihuahua',
    cosmosWithdrawalType: 'Injective to Cosmos Hub',
    ethWithdrawalType: 'Injective to Ethereum',
    evmosWithdrawalType: 'Injective to Evmos',
    junoWithdrawalType: 'Injective to Juno',
    osmosisWithdrawalType: 'Injective to Osmosis',
    terraWithdrawalType: 'Injective to Terra',

    transfers: {
      origin: 'Origin',
      destination: 'Destination',
      asset: 'Asset',
      transfers: 'Transfers',
      type: 'Type',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      amount: 'Amount',
      in: 'In',
      out: 'Out',
      amountTooltip: 'The amount that was transferred'
    }
  }
}
