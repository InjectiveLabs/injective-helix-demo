export default {
  activity: {
    activities: 'Activities',
    activity: 'Activity',
    spotOrders: 'Spot Orders',
    derivativeOrders: 'Derivative Orders',
    rewardHistory: 'Reward History',
    walletHistory: 'Wallet History',
    fundingPayments: 'Funding Payments',
    openOrders: 'Open Orders',
    tradeHistory: 'Trade History',
    positions: 'Positions',
    ordersHistory: 'Orders History',
    openPositions: 'Open positions',
    cancelOrders: 'Cancel Orders',
    funds: 'Funds'
  },

  fundingPayments: {
    emptyFundingPayments: 'No funding payments found',
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
    subaccountDepositType: 'Injective Wallet to Trading Account',
    subaccountWithdrawalType: 'Trading Account to Injective Wallet',
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
