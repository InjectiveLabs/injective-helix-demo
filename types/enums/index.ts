export * from './mixpanel'
export * from './cy'

export enum Modal {
  Terms = 'terms',
  QrCode = 'qrcode',
  Connect = 'connect',
  DevMode = 'dev-mode',
  DepositQr = 'deposit-qr',
  SgtBanner = 'sgt-banner',
  JoinGuild = 'join-guild',
  LpRewards = 'lp-rewards',
  LiteBridge = 'lite-bridge',
  AddGrantee = 'add-grantee',
  BidConfirm = 'bid-confirm',
  MarketBeta = 'market-beta',
  FiatOnboard = 'fiat-onboard',
  CreateGuild = 'create-guild',
  SwapSuccess = 'swap-success',
  BankTransfer = 'bank-transfer',
  AssetDetails = 'asset-details',
  OrderConfirm = 'order-confirm',
  UserFeedback = 'user-feedback',
  MitoRedirect = 'mito-redirect',
  PostOnlyMode = 'post-only-mode',
  GasFeeRebate = 'gas-fee-rebate',
  GeoRestricted = 'geo-restricted',
  MarketExpired = 'market-expired',
  TokenSelector = 'token-selector',
  ScavengerHunt = 'scavenger-hunt',
  ConnectMobile = 'connect-mobile',
  PriceDeviation = 'price-deviation',
  SgtBalancedFees = 'sgtBalancedFees',
  ClosedRWAMarket = 'closed-rwa-market',
  NinjaPassWinner = 'ninja-pass-winner',
  TokenSelectorTo = 'token-selector-to',
  MarketNotLiquid = 'market-not-liquid',
  CreateSubaccount = 'create-subaccount',
  MarketRestricted = 'market-restricted',
  LeaderboardTerms = 'leaderboard-terms',
  SharePositionPnl = 'share-position-pnl',
  InstitutionalForm = 'institutionalForm',
  CompetitionWinner = 'competition-winner',
  MarketNotOnHelix = 'market-not-on-helix',
  TokenSelectorFrom = 'token-selector-from',
  SubaccountTransfer = 'subaccount-transfer',
  CheckSpotGridAuth = 'check-spot-grid-auth',
  AlreadyJoinedGuild = 'already-joined-guild',
  MobileTradeDetails = 'mobile-trade-details',
  ShareLeaderboardPnl = 'share-leaderboard-pnl',
  GridStrategyDetails = 'grid-strategy-details',
  DelegateToValidator = 'delegate-to-validator',
  MarketRewardFactors = 'market-reward-factors',
  AddMarginToPosition = 'add-margin-to-position',
  VerifyJoinGuildHash = 'verify-join-guild-hash',
  NewFeatureTalisLaunch = 'new-feature-talis-launch',
  AddTakeProfitStopLoss = 'add-take-profit-stop-loss',
  CreateSpotGridStrategy = 'create-spot-grid-strategy',
  TransferToMainSubaccount = 'transfer-to-main-subaccount',
  ShareLeaderboardCompetition = 'share-leaderboard-competition'
}

export enum Breakpoint {
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
  Xs = 'xs',
  Xxs = 'xxs'
}

export enum TransferSide {
  Bank = 'Bank',
  TradingAccount = 'TradingAccount'
}

export enum TradeTypes {
  Limit = 'limit',
  Market = 'market'
}

export enum SpotTradeDirection {
  Buy = 'buy',
  Sell = 'sell'
}

export enum DerivativeTradeTypes {
  Limit = 'limit',
  Market = 'market',
  StopLimit = 'stop-limit',
  StopMarket = 'stop-market'
}

export enum TradeSelectorType {
  Type = 'type',
  TypeAllDerivatives = 'type-all-derivatives',
  TypeAllSpot = 'type-all-spot',
  Side = 'side',
  PositionSide = 'position-side',
  TransferType = 'transfer-type'
}

export enum StreamType {
  SpotTrades = 'spot-trades',
  OraclePrices = 'oracle-prices',
  DerivativesTrades = 'derivatives-trades',
  BankBalance = 'bank-balance',
  SubaccountBalances = 'subaccount-balances',
  SpotOrderbookUpdate = 'spot-orderbook-update',
  SpotSubaccountOrders = 'spot-subaccount-orders',
  SpotSubaccountTrades = 'spot-subaccount-trades',
  DerivativesOrderbookUpdate = 'derivatives-orderbook-update',
  SpotSubaccountOrderHistory = 'spot-subaccount-order-history',
  DerivativesSubaccountOrders = 'derivatives-subaccount-orders',
  DerivativesSubaccountTrades = 'derivatives-subaccount-trades',
  DerivativesSubaccountPositions = 'derivatives-positions-trades',
  DerivativesSubaccountOrderHistory = 'derivatives-subaccount-order-history'
}

export enum AveragePriceOptions {
  None = 0,
  BaseAmount = 1,
  QuoteAmount = 2,
  Percentage = 3
}

export enum SurveyTitle {
  HelixUserSurveyFeb23 = 'helix-user-survey-feb-23'
}

export enum DefaultMarket {
  Perpetual = 'btc-usdt-perp',
  PerpetualTestnet = 'btc-usdt-perp-pyth',
  Spot = 'inj-usdt'
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
  Available = 'available',
  Value = 'value'
}

export enum BusEvents {
  FundingRefresh = 'funding-refresh',
  NavLinkClicked = 'nav-link-clicked',
  WalletConnected = 'wallet-connected',
  PostOnlyToggled = 'post-only-toggled',
  SubaccountChange = 'subaccount-change',
  OrderSideToggled = 'order-side-toggled',
  OrderbookReplaced = 'orderbook-replaced',
  AutoSignConnected = 'auto-sign-connected',
  ShowLedgerConnect = 'show-ledger-connect',
  UpdateMarketChart = 'update-market-chart',
  OrderbookSizeClick = 'orderbook-size-click',
  SharePositionOpened = 'share-position-opened',
  OrderbookPriceClick = 'orderbook-price-click',
  AddMarginToPosition = 'add-margin-to-position',
  ActivityFilterUpdate = 'activity-filter-update',
  OpenTradingBotDetails = 'open-trading-bot-details',
  OrderbookNotionalClick = 'orderbook-notional-click',
  AssetDetailsModalPayload = 'asset-details-modal-payload',
  ConnectMobileModalOpened = 'connect-mobile-modal-opened',
  ShareLeaderboardPnlOpened = 'share-leaderboard-pnl-opened',
  BankTransferModalWithDenom = 'bank-transfer-modal-with-denom',
  SpotStreamLimitTradeExecuted = 'spot-stream-limit-trade-executed',
  TradeConfirmationModalPayload = 'trade-confirmation-modal-payload',
  ShareLeaderboardCompetitionOpened = 'share-leaderboard-competition-opened',
  DerivativeStreamLimitTradeExecuted = 'derivative-stream-limit-trade-executed'
}

export enum ActivityField {
  Symbol = 'Symbol',
  Denom = 'Denom',
  Limit = 'Limit',
  Page = 'Page',
  Side = 'Side',
  Type = 'Type'
}

export enum SubaccountTransferField {
  Amount = 'Amount',
  SrcSubaccountId = 'SrcSubaccountId',
  DstSubaccountId = 'DstSubaccountId',
  Denom = 'Denom',
  Token = 'Token'
}

export enum TradeField {
  BaseAmount = 'Base amount',
  BaseDenom = 'Base denom',
  Leverage = 'Leverage',
  LimitPrice = 'Limit price',
  OrderSide = 'Order side',
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
  FundingHistory = 'Positions/FundingHistory',
  SpotOrders = 'Spot/Index',
  SpotOrderHistory = 'Spot/OrderHistory',
  SpotTradeHistory = 'Spot/TradeHistory',
  DerivativeOrders = 'Derivatives/Index',
  DerivativeAdvancedOrders = 'Derivatives/AdvancedOrders',
  DerivativeOrderHistory = 'Derivatives/OrderHistory',
  DerivativeTradeHistory = 'Derivatives/TradeHistory',
  WalletTransfers = 'WalletHistory/Transfers',
  WalletDeposits = 'WalletHistory/Deposits',
  WalletWithdrawals = 'WalletHistory/Withdrawals'
}

export enum AggregatedBalanceType {
  Inj = 'inj',
  Aggregated = 'aggregated'
}

export enum NoticeBanner {
  ScheduledUpgradeJanuary2024 = 'scheduled-upgrade-january-2024',
  ScheduledUpgradeAugust2024 = 'scheduled-upgrade-august-2024',
  TeslaCampaign = 'tesla-campaign'
}

export enum SubaccountBalanceStreamType {
  AvailableBalance = 'available_balances',
  TotalBalance = 'total_balances'
}

export enum PaginationState {
  InvalidQuery = 'invalid-query',
  QueryPageExist = 'query-page-exist',
  QueryMoreThanTotalPage = 'query-more-than-total-page'
}

export enum InstitutionalFormField {
  FirstName = 'firstName',
  LastName = 'lastName',
  Email = 'email',
  Company = 'company',
  Telegram = 'telegram'
}

export enum SpotGridTradingField {
  Grids = 'grids',
  SettleIn = 'SettleIn',
  ExitType = 'exitType',
  StopLoss = 'stopLoss',
  LowerPrice = 'lowerPrice',
  UpperPrice = 'upperPrice',
  TakeProfit = 'takeProfit',
  StrategyType = 'strategyType',
  InvestmentType = 'investmentType',
  QuoteInvestmentAmount = 'quoteInvestmentAmount',
  SellBaseOnStopLoss = 'sellBaseOnStopLoss',
  BuyBaseOnTakeProfit = 'buyBaseOnTakeProfit',
  BaseInvestmentAmount = 'baseInvestmentAmount',
  IsAssetRebalanceOn = 'isAssetRebalanceOn',
  IsTrailingEnabled = 'isTrailingEnabled',
  TrailingUpper = 'trailingUpper',
  TrailingLower = 'trailingLower'
}

export enum DerivativeGridTradingField {
  Grids = 'grids',
  Margin = 'margin',
  Leverage = 'leverage',
  LowerPrice = 'lowerPrice',
  UpperPrice = 'upperPrice',
  StopLoss = 'stopLoss',
  TakeProfit = 'takeProfit'
}

export enum SpotGridMessages {
  MsgCreateSpotLimitOrder = 'injective.exchange.v1beta1.MsgCreateSpotLimitOrder',
  MsgCreateSpotMarketOrder = 'injective.exchange.v1beta1.MsgCreateSpotMarketOrder',
  MsgWithdraw = 'injective.exchange.v1beta1.MsgWithdraw',
  MsgBatchUpdateOrders = 'injective.exchange.v1beta1.MsgBatchUpdateOrders'
}

export enum GridStrategyTabs {
  Running = 'running',
  History = 'history'
}

export enum InvestmentTypeGst {
  Base = 'base',
  Quote = 'quote',
  BaseAndQuote = 'baseAndQuote'
}

export enum StrategyStatus {
  Active = 'active',
  Removed = 'removed'
}

export enum StopReason {
  User = 'user',
  StopLoss = 'stop_loss',
  Emergency = 'emergency',
  TakeProfit = 'take_profit',
  InsufficientFunds = 'insufficient_funds',
  ExceededMaxRetries = 'exceeded_max_retries'
}

export enum GridStrategyType {
  Auto = 'auto',
  Manual = 'manual'
}

export enum GuildSortBy {
  TVL = 'tvl',
  Volume = 'volume'
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}

export enum ChartViewOption {
  Chart = 'chart',
  // ProChart = 'pro-chart',
  Depth = 'depth',
  Info = 'info'
}

export enum OrderbookViewOption {
  Orderbook = 'orderbook',
  Trades = 'trades'
}

export enum MarketHeaderType {
  Market = 'market',
  Change = 'change',
  Volume = 'volume',
  Price = 'price'
}

export enum TradingInterface {
  Standard = 'standard',
  TradingBots = 'trading-bots'
}

export enum SgtMarketType {
  Spot = 'spot',
  Derivative = 'derivative'
}

export enum VolatilityStrategyType {
  Passive = 'passive',
  Moderate = 'moderate',
  Aggressive = 'aggressive'
}

export enum LiquidityBotField {
  Volatility = 'volatility',
  BaseAmount = 'baseAmount',
  QuoteAmount = 'quoteAmount'
}

export enum SpotOrdersStandardView {
  Orders = 'orders',
  Balances = 'balances',
  TradeHistory = 'tradeHistory',
  OrderHistory = 'orderHistory'
}

export enum SpotOrdersTradingBotsView {
  Orders = 'orders',
  TradeHistory = 'tradeHistory',
  OrderHistory = 'orderHistory',
  ActiveStrategies = 'activeStrategies',
  RemovedStrategies = 'removedStrategies'
}

export enum PerpOrdersStandardView {
  Balances = 'balances',
  Positions = 'positions',
  Orders = 'orders',
  AdvancedOrders = 'advancedOrders',
  OrderHistory = 'orderHistory',
  TradeHistory = 'tradeHistory',
  FundingHistory = 'fundingHistory'
}

export enum PerpOrdersTradingBotsView {
  ActiveStrategies = 'activeStrategies',
  RemovedStrategies = 'removedStrategies'
  // OpenPositions = 'openPositions',
  // OpenOrders = 'openOrders',
  // Triggers = 'triggers',
  // OrderHistory = 'orderHistory',
  // TradeHistory = 'tradeHistory'
}

export enum PositionsFilterField {
  Market = 'market',
  Side = 'side'
}

export enum SpotOpenOrdersFilterField {
  Market = 'market',
  Side = 'side'
}

export enum SpotOrderHistoryFilterField {
  Market = 'market',
  Side = 'side',
  Type = 'type'
}

export enum OrderTypeFilter {
  Market = 'market',
  Limit = 'limit',
  StopLossLimit = 'stopLossLimit',
  StopLossMarket = 'stopLossMarket',
  TakeProfitLimit = 'takeProfitLimit',
  TakeProfitMarket = 'takeProfitMarket'
}

export enum SpotTradeFormField {
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  PostOnly = 'postOnly',
  Slippage = 'slippage',
  AmountOption = 'amountOption',
  IsSlippageOn = 'isSlippageOn',
  BypassPriceWarning = 'bypassPriceWarning'
}

export enum TradeAmountOption {
  Base = 'base',
  Quote = 'quote'
}

export enum DerivativesTradeFormField {
  Type = 'type',
  Side = 'side',
  Amount = 'amount',
  Leverage = 'leverage',
  PostOnly = 'postOnly',
  Slippage = 'slippage',
  StopLoss = 'stopLoss',
  LimitPrice = 'limitPrice',
  ReduceOnly = 'reduceOnly',
  TakeProfit = 'takeProfit',
  AmountOption = 'amountOption',
  TriggerPrice = 'triggerPrice',
  IsSlippageOn = 'isSlippageOn',
  isTpSlEnabled = 'isTpSlEnabled',
  BypassPriceWarning = 'bypassPriceWarning'
}

export enum ClosePositionLimitFormField {
  Price = 'price',
  Quantity = 'quantity'
}

export enum TakeProfitStopLossFormField {
  TakeProfit = 'takeProfit',
  StopLoss = 'stopLoss'
}

export enum PortfolioChartType {
  Balance = 'balance',
  Pnl = 'pnl',
  Volume = 'volume'
}

export enum LiquidityProvisionTypeOption {
  All = 'All',
  Helix = 'Helix',
  Mito = 'Mito'
}

export enum LeaderboardType {
  Pnl = 'pnl_leaderboard',
  Volume = 'volume_leaderboard'
}

export enum LeaderboardDuration {
  All = 'ALL',
  OneMonth = '1M',
  OneWeek = '1W',
  OneDay = '1D'
}

export enum LeaderboardCampaignStatus {
  Active = 'active',
  Inactive = 'inactive',
  Upcoming = 'upcoming'
}

export enum DontShowAgain {
  AutoSign = 'auto-sign'
}

export enum BotType {
  SpotGrid = 'spotGrid',
  LiquidityGrid = 'liquidityGrid',
  FuturesGrid = 'futuresGrid'
}

export enum StrategyPerformance {
  Top = 'top',
  Worst = 'worst'
}

export enum LiquidityProvisionType {
  MitoVault = 'mito-vault',
  InjectiveStaking = 'injective-staking',
  HelixSpotGridBot = 'helix-spot-grid-bot'
}

export enum MitoRegistrationMode {
  Restricted = 'Restricted',
  Permissionless = 'Permissionless'
}

export enum MarketFilterType {
  All = 'all',
  Volume = 'volume',
  New = 'new',
  Upcoming = 'upcoming'
}

export enum MarketCategoryType {
  All = 'all',
  Favorites = 'favorites',
  Perps = 'perps',
  Spot = 'spot',
  Trending = 'trending',
  Injective = 'injective',
  Layer1 = 'layer-1',
  Layer2 = 'layer-2',
  Experimental = 'experimental',
  DeFi = 'deFi',
  AI = 'aI',
  Meme = 'meme',
  RWA = 'rwa'
  // All = 'all',
  // Cosmos = 'cosmos',
  // Ethereum = 'ethereum',
  // Injective = 'injective',
  // Solana = 'solana',
  // Experimental = 'experimental',
  // RWA = 'RWA',
}

export enum MarketQuoteType {
  All = 'all',
  USDT = 'usdt',
  USDC = 'usdc',
  INJ = 'inj'
}

export enum TradingChartInterval {
  '1m' = '1',
  '3m' = '3',
  '5m' = '5',
  '15m' = '15',
  '30m' = '30',
  '1h' = '60',
  '2h' = '120',
  '4h' = '240',
  '6h' = '360',
  'D' = '1D',
  'W' = '1W'
}
