export * from './cy'
export * from './mixpanel'

export enum DontShowAgain {
  AutoSign = 'auto-sign'
}

export enum GuildSortBy {
  TVL = 'tvl',
  Volume = 'volume'
}

export enum TradingLayout {
  Left = 'left',
  Right = 'right'
}

export enum TradeTypes {
  Limit = 'limit',
  Market = 'market'
}

export enum SpotTradeDirection {
  Buy = 'buy',
  Sell = 'sell'
}

export enum TradeAmountOption {
  Base = 'base',
  Quote = 'quote'
}

export enum StrategyPerformance {
  Top = 'top',
  Worst = 'worst'
}

export enum GridStrategyType {
  Auto = 'auto',
  Manual = 'manual'
}

export enum PositionsFilterField {
  Side = 'side',
  Market = 'market'
}

export enum SgtMarketType {
  Spot = 'spot',
  Derivative = 'derivative'
}

export enum GridStrategyTabs {
  Running = 'running',
  History = 'history'
}

export enum SpotOpenOrdersFilterField {
  Side = 'side',
  Market = 'market'
}

export enum SurveyTitle {
  HelixUserSurveyFeb23 = 'helix-user-survey-feb-23'
}

export enum AggregatedBalanceType {
  Inj = 'inj',
  Aggregated = 'aggregated'
}

export enum TransferSide {
  Bank = 'Bank',
  TradingAccount = 'TradingAccount'
}

export enum OrderbookViewOption {
  Trades = 'trades',
  Orderbook = 'orderbook'
}

export enum ClosePositionLimitFormField {
  Price = 'price',
  Quantity = 'quantity'
}

export enum WalletModalType {
  All = 'all',
  Ledger = 'ledger',
  Trezor = 'trezor'
}

export enum TradingInterface {
  Standard = 'standard',
  TradingBots = 'trading-bots'
}

export enum OrderbookLayout {
  Buys = 'buys',
  Sells = 'sells',
  Default = 'default'
}

export enum LeaderboardType {
  Pnl = 'pnl_leaderboard',
  Volume = 'volume_leaderboard'
}

export enum Breakpoint {
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
  Xs = 'xs',
  Xxs = 'xxs'
}

export enum PortfolioChartType {
  Pnl = 'pnl',
  Volume = 'volume',
  Balance = 'balance'
}

export enum LiquidityProvisionTypeOption {
  All = 'All',
  Mito = 'Mito',
  Helix = 'Helix'
}

export enum MarketQuoteType {
  All = 'all',
  INJ = 'inj',
  USDT = 'usdt',
  USDC = 'usdc'
}

export enum StrategyStatus {
  Active = 'active',
  Pending = 'pending',
  Removed = 'removed'
}

export enum TakeProfitStopLossFormField {
  StopLoss = 'stopLoss',
  TakeProfit = 'takeProfit'
}

export enum SpotOrderHistoryFilterField {
  Side = 'side',
  Type = 'type',
  Market = 'market'
}

export enum AveragePriceOptions {
  None = 0,
  BaseAmount = 1,
  Percentage = 3,
  QuoteAmount = 2
}

export enum InvestmentTypeGst {
  Base = 'base',
  Quote = 'quote',
  BaseAndQuote = 'baseAndQuote'
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}

export enum MitoRegistrationMode {
  Restricted = 'Restricted',
  Permissionless = 'Permissionless'
}

export enum LeaderboardDuration {
  All = 'ALL',
  OneDay = '1D',
  OneWeek = '1W',
  OneMonth = '1M'
}

export enum MarketFilterType {
  All = 'all',
  New = 'new',
  Volume = 'volume',
  Upcoming = 'upcoming'
}

export enum LeaderboardCampaignStatus {
  Active = 'active',
  Inactive = 'inactive',
  Upcoming = 'upcoming'
}

export enum MarketHeaderType {
  Price = 'price',
  Market = 'market',
  Change = 'change',
  Volume = 'volume'
}

export enum BotType {
  SpotGrid = 'spotGrid',
  FuturesGrid = 'futuresGrid',
  LiquidityGrid = 'liquidityGrid'
}

export enum ChartViewOption {
  Info = 'info',
  Chart = 'chart',
  // ProChart = 'pro-chart',
  Depth = 'depth'
}

export enum VolatilityStrategyType {
  Passive = 'passive',
  Moderate = 'moderate',
  Aggressive = 'aggressive'
}

export enum SubaccountBalanceStreamType {
  TotalBalance = 'total_balances',
  AvailableBalance = 'available_balances'
}

export enum LiquidityBotField {
  Volatility = 'volatility',
  BaseAmount = 'baseAmount',
  QuoteAmount = 'quoteAmount'
}

export enum DefaultMarket {
  Spot = 'inj-usdt',
  Perpetual = 'btc-usdt-perp',
  PerpetualTestnet = 'btc-usdt-perp-pyth'
}

export enum DerivativeTradeTypes {
  Limit = 'limit',
  Market = 'market',
  StopLimit = 'stop-limit',
  StopMarket = 'stop-market'
}

export enum BalanceHeaderType {
  None = 'none',
  Asset = 'asset',
  Total = 'total',
  Value = 'value',
  Available = 'available'
}

export enum ActivityField {
  Page = 'Page',
  Side = 'Side',
  Type = 'Type',
  Denom = 'Denom',
  Limit = 'Limit',
  Symbol = 'Symbol'
}

export enum SpotOrdersStandardView {
  Orders = 'orders',
  Balances = 'balances',
  TradeHistory = 'tradeHistory',
  OrderHistory = 'orderHistory'
}

export enum LiquidityProvisionType {
  MitoVault = 'mito-vault',
  InjectiveStaking = 'injective-staking',
  HelixSpotGridBot = 'helix-spot-grid-bot'
}

export enum InstitutionalFormField {
  Email = 'email',
  Company = 'company',
  LastName = 'lastName',
  Telegram = 'telegram',
  FirstName = 'firstName'
}

export enum PaginationState {
  InvalidQuery = 'invalid-query',
  QueryPageExist = 'query-page-exist',
  QueryMoreThanTotalPage = 'query-more-than-total-page'
}

export enum SubaccountTransferField {
  Denom = 'Denom',
  Token = 'Token',
  Amount = 'Amount',
  SrcSubaccountId = 'SrcSubaccountId',
  DstSubaccountId = 'DstSubaccountId'
}

export enum TradingChartInterval {
  '1m' = '1',
  '3m' = '3',
  '5m' = '5',
  'D' = '1D',
  'W' = '1W',
  '1h' = '60',
  '15m' = '15',
  '30m' = '30',
  '2h' = '120',
  '4h' = '240',
  '6h' = '360'
}

export enum SpotOrdersTradingBotsView {
  Orders = 'orders',
  TradeHistory = 'tradeHistory',
  OrderHistory = 'orderHistory',
  ActiveStrategies = 'activeStrategies',
  RemovedStrategies = 'removedStrategies'
}

export enum TradeSelectorType {
  Type = 'type',
  Side = 'side',
  TypeAllSpot = 'type-all-spot',
  PositionSide = 'position-side',
  TransferType = 'transfer-type',
  TypeAllDerivatives = 'type-all-derivatives'
}

export enum StopReason {
  User = 'user',
  StopLoss = 'stop_loss',
  Emergency = 'emergency',
  TakeProfit = 'take_profit',
  InsufficientFunds = 'insufficient_funds',
  ExceededMaxRetries = 'exceeded_max_retries'
}

export enum DerivativeGridTradingField {
  Grids = 'grids',
  Margin = 'margin',
  Leverage = 'leverage',
  StopLoss = 'stopLoss',
  LowerPrice = 'lowerPrice',
  UpperPrice = 'upperPrice',
  TakeProfit = 'takeProfit'
}

export enum OrderTypeFilter {
  Limit = 'limit',
  Market = 'market',
  StopLossLimit = 'stopLossLimit',
  StopLossMarket = 'stopLossMarket',
  TakeProfitLimit = 'takeProfitLimit',
  TakeProfitMarket = 'takeProfitMarket'
}

export enum TradeExecutionType {
  Market = 'market',
  LimitFill = 'limitFill',
  StopLimit = 'stopLimit',
  StopMarket = 'stopMarket',
  LimitMatchNewOrder = 'limitMatchNewOrder',
  LimitMatchRestingOrder = 'limitMatchRestingOrder'
}

export enum SpotTradeFormField {
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  PostOnly = 'postOnly',
  Slippage = 'slippage',
  AmountOption = 'amountOption',
  BypassPriceWarning = 'bypassPriceWarning'
}

export enum PerpOrdersTradingBotsView {
  Positions = 'positions',
  OpenOrders = 'openOrders',
  OrderHistory = 'orderHistory',
  TradeHistory = 'tradeHistory',
  ActiveStrategies = 'activeStrategies',
  RemovedStrategies = 'removedStrategies'
}

export enum PerpOrdersStandardView {
  Orders = 'orders',
  Balances = 'balances',
  Positions = 'positions',
  OrderHistory = 'orderHistory',
  TradeHistory = 'tradeHistory',
  AdvancedOrders = 'advancedOrders',
  FundingHistory = 'fundingHistory'
}

export enum MarketCategoryType {
  AI = 'aI',
  All = 'all',
  RWA = 'rwa',
  Spot = 'spot',
  DeFi = 'deFi',
  Meme = 'meme',
  Perps = 'perps',
  Layer1 = 'layer-1',
  Layer2 = 'layer-2',
  iAssets = 'iAssets',
  Trending = 'trending',
  Favorites = 'favorites',
  Injective = 'injective'
}

export enum NoticeBanner {
  NeptuneUsdt = 'neptune-usdt',
  TeslaCampaign = 'tesla-campaign',
  AuthzConnected = 'authz-connected',
  FTMSettleMarket = 'ftm-settle-market',
  PostChainUpgrade = 'post-chain-upgrade',
  UpcomingChainUpgrade = 'upcoming-chain-upgrade',
  OwnYourAssetCampaign = 'own-your-asset-campaign'
}

export enum SpotGridMessages {
  MsgWithdraw = 'injective.exchange.v1beta1.MsgWithdraw',
  MsgBatchUpdateOrders = 'injective.exchange.v1beta1.MsgBatchUpdateOrders',
  MsgCreateSpotLimitOrder = 'injective.exchange.v1beta1.MsgCreateSpotLimitOrder',
  MsgCreateSpotMarketOrder = 'injective.exchange.v1beta1.MsgCreateSpotMarketOrder'
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
  isTpSlEnabled = 'isTpSlEnabled',
  BypassPriceWarning = 'bypassPriceWarning'
}

export enum TradeField {
  Leverage = 'Leverage',
  PostOnly = 'Post-Only',
  BaseDenom = 'Base denom',
  OrderSide = 'Order side',
  BaseAmount = 'Base amount',
  LimitPrice = 'Limit price',
  QuoteDenom = 'Quote denom',
  ReduceOnly = 'Reduce-Only',
  QuoteAmount = 'Quote amount',
  TradingType = 'Trading type',
  TriggerPrice = 'Trigger price',
  SlippageTolerance = 'Slippage tolerance',
  ProportionalPercentage = 'Proportional percentage'
}

export enum ActivityView {
  SpotOrders = 'Spot/Index',
  Positions = 'Positions/Index',
  SpotOrderHistory = 'Spot/OrderHistory',
  SpotTradeHistory = 'Spot/TradeHistory',
  DerivativeOrders = 'Derivatives/Index',
  WalletDeposits = 'WalletHistory/Deposits',
  FundingHistory = 'Positions/FundingHistory',
  WalletTransfers = 'WalletHistory/Transfers',
  WalletWithdrawals = 'WalletHistory/Withdrawals',
  DerivativeOrderHistory = 'Derivatives/OrderHistory',
  DerivativeTradeHistory = 'Derivatives/TradeHistory',
  DerivativeAdvancedOrders = 'Derivatives/AdvancedOrders'
}

export enum SpotGridTradingField {
  Grids = 'grids',
  SettleIn = 'SettleIn',
  ExitType = 'exitType',
  StopLoss = 'stopLoss',
  IsLpMode = 'isLpMode',
  LowerPrice = 'lowerPrice',
  UpperPrice = 'upperPrice',
  TakeProfit = 'takeProfit',
  StrategyType = 'strategyType',
  TrailingUpper = 'trailingUpper',
  TrailingLower = 'trailingLower',
  InvestmentType = 'investmentType',
  IsTrailingEnabled = 'isTrailingEnabled',
  SellBaseOnStopLoss = 'sellBaseOnStopLoss',
  IsAssetRebalanceOn = 'isAssetRebalanceOn',
  BuyBaseOnTakeProfit = 'buyBaseOnTakeProfit',
  BaseInvestmentAmount = 'baseInvestmentAmount',
  QuoteInvestmentAmount = 'quoteInvestmentAmount'
}

export enum StreamType {
  SpotTrades = 'spot-trades',
  BankBalance = 'bank-balance',
  OraclePrices = 'oracle-prices',
  DerivativesTrades = 'derivatives-trades',
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

export enum BusEvents {
  NeptuneUsdt = 'neptune-usdt',
  FundingRefresh = 'funding-refresh',
  NavLinkClicked = 'nav-link-clicked',
  WalletConnected = 'wallet-connected',
  PostOnlyToggled = 'post-only-toggled',
  SubaccountChange = 'subaccount-change',
  OrderSideToggled = 'order-side-toggled',
  OrderbookReplaced = 'orderbook-replaced',
  AutoSignConnected = 'auto-sign-connected',
  UpdateMarketChart = 'update-market-chart',
  OrderbookSizeClick = 'orderbook-size-click',
  SharePositionOpened = 'share-position-opened',
  OrderbookPriceClick = 'orderbook-price-click',
  AddMarginToPosition = 'add-margin-to-position',
  OpenTradingBotDetails = 'open-trading-bot-details',
  SetPositionStatusIdle = 'set-position-status-idle',
  OrderbookNotionalClick = 'orderbook-notional-click',
  ConnectMobileModalOpened = 'connect-mobile-modal-opened',
  BankTransferModalWithDenom = 'bank-transfer-modal-with-denom',
  ShareLeaderboardStatsOpened = 'share-leaderboard-stats-opened',
  SpotStreamLimitTradeExecuted = 'spot-stream-limit-trade-executed',
  DerivativeStreamLimitTradeExecuted = 'derivative-stream-limit-trade-executed'
}

export enum Modal {
  Terms = 'terms',
  QrCode = 'qrcode',
  Connect = 'connect',
  DevMode = 'dev-mode',
  IAsset = 'iasset-modal',
  JoinGuild = 'join-guild',
  LpRewards = 'lp-rewards',
  LiteBridge = 'lite-bridge',
  AddGrantee = 'add-grantee',
  FiatOnboard = 'fiat-onboard',
  CreateGuild = 'create-guild',
  SwapSuccess = 'swap-success',
  NeptuneUsdt = 'neptune-usdt',
  BankTransfer = 'bank-transfer',
  UserFeedback = 'user-feedback',
  MitoRedirect = 'mito-redirect',
  PostOnlyMode = 'post-only-mode',
  GeoRestricted = 'geo-restricted',
  ShareReferral = 'share-referral',
  ConnectMobile = 'connect-mobile',
  SgtBalancedFees = 'sgtBalancedFees',
  ConfirmReferral = 'confirm-referral',
  ClosedRWAMarket = 'closed-rwa-market',
  NinjaPassWinner = 'ninja-pass-winner',
  MarketRestricted = 'market-restricted',
  LeaderboardTerms = 'leaderboard-terms',
  SharePositionPnl = 'share-position-pnl',
  InstitutionalForm = 'institutionalForm',
  CompetitionWinner = 'competition-winner',
  MarketNotOnHelix = 'market-not-on-helix',
  OptimizeSgtValues = 'optimize-sgt-values',
  SubaccountTransfer = 'subaccount-transfer',
  CreateReferralLink = 'create-referral-link',
  AlreadyJoinedGuild = 'already-joined-guild',
  GridStrategyDetails = 'grid-strategy-details',
  AddMarginToPosition = 'add-margin-to-position',
  VerifyJoinGuildHash = 'verify-join-guild-hash',
  PartialClosePosition = 'partial-close-position',
  ClosePositionWarning = 'close-position-warning',
  ShareLeaderboardStats = 'share-leaderboard-stats',
  AddTakeProfitStopLoss = 'add-take-profit-stop-loss',
  NewFeatureTradFiLaunch = 'new-feature-tradfi-launch',
  TransferToMainSubaccount = 'transfer-to-main-subaccount'
}

export type BaseQuoteFields = Exclude<
  TradeField,
  | TradeField.BaseDenom
  | TradeField.LimitPrice
  | TradeField.QuoteDenom
  | TradeField.TriggerPrice
  | TradeField.ProportionalPercentage
>
