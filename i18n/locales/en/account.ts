import { BalanceTableColumn, I18nMessageFunction } from '@/types'

export default {
  account: {
    qrDeposit: {
      title: 'Send INJ to this address to begin trading instantly',
      link: 'Injective bridge',
      ctaLink: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          "Don't have INJ? Click ",
          named('link'),
          ' to go to the bridge.'
        ])
    },
    table: {
      [BalanceTableColumn.Assets]: 'Assets',
      [BalanceTableColumn.Available]: 'Available',
      [BalanceTableColumn.UsedOrReserved]: 'In Use/Reserved',
      [BalanceTableColumn.UnrealizedPnl]: 'Unrealized PnL',
      [BalanceTableColumn.Total]: 'Total',
      [BalanceTableColumn.TotalUsd]: 'Total Value (USD)',
      [BalanceTableColumn.Staked]: 'Staked',
      [BalanceTableColumn.StakedUsd]: 'Staked (USD)'
    },
    action: 'Action',
    assets: 'Assets',
    accountOverview: 'Account Overview',
    available: 'Available',
    fee: 'Fee',
    netWorth: 'Tradeable Net Worth',
    total: 'Total',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    transfer: 'Transfer',
    transferOnChain: 'Transfer to address',
    trade: 'Trade',
    filters: 'Filters',
    filterByAsset: 'Filter by asset',
    showUnverifiedAssets: 'Show unverified assets',
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
        totalValueUsd: 'Total Value (USD)',
        availableBalance: 'Available',
        inUseReserved: 'In Use/Reserved',
        unrealized: 'Unrealized PnL',
        value: ({ named }: I18nMessageFunction) => `Value (${named('symbol')})`
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
        leverage: 'Leverage',
        tpSl: 'TP/SL'
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
    from: 'FROM',
    to: 'TO',
    injectiveBridge: 'Injective Bridge',
    wormhole: 'Wormhole (Ethereum)',
    solana: 'Wormhole (Solana)',

    balanceBreakdownExplorer: 'Your full balance breakdown can be found on the',
    explorer: 'explorer',
    main: 'Main',
    account: 'Subaccount',
    subaccount: 'Subaccount',
    accountBalance: 'Subaccount Balance',
    staked: 'Staked',

    createSubaccount: 'Create Subaccount',
    subaccountCreation: 'Subaccount Creation',
    createSubaccountNote: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'This is a secondary account linked to your main account for separate management and trading of digital assets. ',
        named('split'),
        'To activate it, you first need to transfer funds. Learn more about subaccounts in our',
        named('faq')
      ]),
    subaccountTransfer: 'Subaccount Transfer',
    unrealizedPnLLoading: 'Loading your positions and unrealized PnL.',
    transferToMainSubaccount: 'Transfer to Main Subaccount',
    amount: 'Amount',
    noAssetToTransfer:
      "You don't have any assets to transfer from this subaccount.",
    transferToSubaccountSuccess: 'Subaccount transfer successful',
    mainSubaccount: 'Main Subaccount',
    subaccountId: ({ named }: I18nMessageFunction) =>
      `Subaccount ${named('subaccountId')}`,
    balanceIncludesCw20Balance:
      'This balance includes the CW20 balance of the asset. The whole CW20 balance will be converted to bank balance once you make an order on this market.'
  }
}
