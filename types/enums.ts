export enum Change {
  New = 'new',
  NoChange = 'no-change',
  Increase = 'increase',
  Decrease = 'decrease'
}

export enum WalletConnectStatus {
  connecting = 'Connecting',
  disconnected = 'Disconnected',
  idle = 'Idle',
  connected = 'Connected'
}

export enum Icon {
  Arrow = 'arrow',
  Copy = 'copy',
  Globe = 'globe',
  Discord = 'discord',
  Dropdown = 'dropdown',
  Info = 'info',
  Locked = 'locked',
  Metamask = 'metamask',
  Ledger = 'ledger',
  Reddit = 'reddit',
  Search = 'search',
  Trash = 'trash',
  Star = 'star',
  Sync = 'sync',
  Telegram = 'telegram',
  Trending = 'trending',
  Twitter = 'twitter',
  Unlocked = 'unlocked',
  Wallet = 'wallet',
  CloseCircle = 'close-circle',
  ExternalLink = 'external-link',
  Sort = 'sort'
}

export enum Modal {
  AddMarginToPosition = 'add-margin-to-position',
  AssetDetails = 'asset-details',
  Bridge = 'bridge',
  BridgeCompleted = 'bridge-completed',
  BridgeConfirm = 'bridge-confirm',
  Connect = 'connect',
  ConvertUsdc = 'convert-usdc',
  DelegateToValidator = 'delegate-to-validator',
  GasFeeRebate = 'gas-fee-rebate',
  InsufficientInjForGas = 'insufficient-inj-for-gas',
  MarketBeta = 'market-beta',
  MarketDeprecated = 'market-deprecated',
  MarketExpired = 'market-expired',
  MarketNew = 'market-new',
  MarketRewardFactors = 'market-reward-factors',
  MobileTradeDetails = 'mobile-trade-details',
  NinjaPassWinner = 'ninja-pass-winner',
  OrderConfirm = 'order-confirm',
  PriceDeviation = 'price-deviation',
  Terms = 'terms',
  USDCDetected = 'usdc-detected',
  UserFeedback = 'user-feedback'
}

export enum Breakpoint {
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
  Xs = 'xs',
  Xxs = 'xxs'
}

export enum AppState {
  Busy = 'Busy',
  Loading = 'Loading',
  Idle = 'Idle',
  Error = 'Error',
  Success = 'Success'
}

export enum TransferSide {
  Bank = 'Bank',
  TradingAccount = 'TradingAccount'
}

export enum TransferDirection {
  bankToTradingAccount = 'bank-to-trading-account',
  tradingAccountToBank = 'trading-account-to-bank'
}

export enum BridgeType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer'
}

export enum TradeTypes {
  Limit = 'limit',
  Market = 'market'
}

export enum TradeSelectorType {
  Type = 'type',
  TypeAllDerivatives = 'type-all-derivatives',
  TypeAllSpot = 'type-all-spot',
  Side = 'side',
  PositionSide = 'position-side',
  TransferType = 'transfer-type'
}

export enum MarketFilterType {
  All = 'all',
  Volume = 'volume',
  New = 'new',
  Upcoming = 'upcoming'
}

export enum MarketCategoryType {
  All = 'all',
  Cosmos = 'cosmos',
  Ethereum = 'ethereum',
  Experimental = 'experimental'
}

export enum MarketQuoteType {
  All = 'all',
  USDT = 'usdt',
  USDC = 'usdc'
  // UST = 'ust'
}

export enum StreamType {
  SubaccountBalances = 'subaccount-balances',
  SpotSubaccountOrders = 'spot-subaccount-orders',
  SpotSubaccountOrderHistory = 'spot-subaccount-order-history',
  SpotSubaccountTrades = 'spot-subaccount-trades',
  DerivativesSubaccountOrders = 'derivatives-subaccount-orders',
  DerivativesSubaccountOrderHistory = 'derivatives-subaccount-order-history',
  DerivativesSubaccountTrades = 'derivatives-subaccount-trades',
  DerivativesSubaccountPositions = 'derivatives-positions-trades',
  DerivativesOrderbook = 'derivatives-orderbook',
  DerivativesTrades = 'derivatives-trades',
  DerivativesOrders = 'derivatives-orders',
  SpotOrderbook = 'spot-orderbook',
  SpotTrades = 'spot-trades',
  SpotOrders = 'spot-orders',
  DerivativesPositions = 'derivatives-positions',
  OraclePrices = 'oracle-prices'
}

export enum AveragePriceOptions {
  None = 0,
  BaseAmount = 1,
  QuoteAmount = 2,
  Percentage = 3
}

export enum AmplitudeEvent {
  Login = 'Login',
  Transfer = 'Transfer',
  TradeClicked = 'Trade Clicked',
  ConnectClicked = 'Connect Clicked',
  WalletSelected = 'Wallet Selected',
  ClickPlaceOrder = 'Place Order Attempt',
  AttemptPlaceOrder = 'Place Order Confirm',
  SurveyRejected = 'Survey - Accepted',
  SurveyAccepted = 'Survey - Rejected',
  CosmoverseGiveawayCampaign = 'Cosmoverse Giveaway Campaign'
}

export enum SurveyTitle {
  HelixUserSurveyFeb23 = 'helix-user-survey-feb-23'
}

export enum DefaultMarket {
  Perpetual = 'btc-usdt-perp',
  Spot = 'inj-usdt'
}

export enum TradeClickOrigin {
  Lander = 'LanderC2A',
  MarketsPage = 'Markets Page',
  TopMenu = 'Top Menu'
}

export enum OrderAttemptStatus {
  Success = 'Success',
  Error = 'Error'
}

export enum OrderbookLayout {
  Default = 'default',
  Buys = 'buys',
  Sells = 'sells'
}

export enum TradingLayout {
  Left = 'left',
  Right = 'right'
}

export enum BalanceHeaderType {
  None = 'none',
  Asset = 'asset',
  Total = 'total',
  Wallet = 'wallet',
  TradingAccount = 'trading-account',
  Available = 'available',
  Value = 'value'
}

export enum BusEvents {
  AddMarginToPosition = 'add-margin-to-position',
  AssetDetailsModalPayload = 'asset-details-modal-payload',
  ConvertUsdc = 'convert-usdc',
  FundingRefresh = 'funding-refresh',
  NavLinkClicked = 'nav-link-clicked',
  OrderbookNotionalClick = 'orderbook-notional-click',
  OrderbookPriceClick = 'orderbook-price-click',
  OrderbookSizeClick = 'orderbook-size-click',
  PostOnlyToggled = 'post-only-toggled',
  ShowLedgerConnect = 'show-ledger-connect',
  TradeConfirmationModalPayload = 'trade-confirmation-modal-payload',
  WalletConnected = 'wallet-connected'
}

export enum BridgeBusEvents {
  Transfer = 'transfer',
  TransferToBank = 'transfer-to-bank',
  Deposit = 'deposit',
  Withdraw = 'withdraw'
}

export enum ActivityField {
  Symbol = 'Symbol',
  Denom = 'Denom',
  Limit = 'Limit',
  Page = 'Page',
  Side = 'Side',
  Type = 'Type'
}

export enum BridgeField {
  Amount = 'Amount',
  BridgeType = 'Bridge Type',
  BridgingNetwork = 'Bridging Network',
  Denom = 'Denom',
  Destination = 'Destination',
  Memo = 'Memo',
  Token = 'Token',
  TransferDirection = 'Transfer Direction'
}

export enum TradeField {
  BaseAmount = 'Base amount',
  BaseDenom = 'Base denom',
  Leverage = 'Leverage',
  LimitPrice = 'Limit price',
  OrderType = 'Order type',
  PostOnly = 'Post-Only',
  ProportionalPercentage = 'Proportional percentage',
  QuoteAmount = 'Quote amount',
  QuoteDenom = 'Quote denom',
  ReduceOnly = 'Reduce-Only',
  SlippageTolerance = 'Slippage tolerance',
  TradingType = 'Trading type',
  TriggerPrice = 'Trigger price'
}

export type BaseQuoteFields = Exclude<
  TradeField,
  | TradeField.LimitPrice
  | TradeField.TriggerPrice
  | TradeField.BaseDenom
  | TradeField.QuoteDenom
  | TradeField.ProportionalPercentage
>

export enum TradeExecutionType {
  Market = 'market',
  LimitFill = 'limitFill',
  LimitMatchRestingOrder = 'limitMatchRestingOrder',
  LimitMatchNewOrder = 'limitMatchNewOrder',
  StopLimit = 'stopLimit',
  StopMarket = 'stopMarket'
}

export enum WalletModalType {
  All = 'all',
  Ledger = 'ledger',
  Trezor = 'trezor'
}

export enum ActivityView {
  Positions = 'Positions/Index',
  FundingPayments = 'Positions/FundingPayments',
  SpotOrders = 'Spot/Index',
  SpotOrderHistory = 'Spot/OrderHistory',
  SpotTradeHistory = 'Spot/TradeHistory',
  DerivativeOrders = 'Derivatives/Index',
  DerivativeTriggers = 'Derivatives/Triggers',
  DerivativeOrderHistory = 'Derivatives/OrderHistory',
  DerivativeTradeHistory = 'Derivatives/TradeHistory',
  WalletTransfers = 'WalletHistory/Transfers',
  WalletDeposits = 'WalletHistory/Deposits',
  WalletWithdrawals = 'WalletHistory/Withdrawals'
}

export enum ActivityTab {
  Positions = 'positions',
  Derivatives = 'derivatives',
  Spot = 'spot',
  WalletHistory = 'walletHistory'
}

export enum AggregatedBalanceType {
  USDC = 'usdc'
}
