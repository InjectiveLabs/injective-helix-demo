import { MarketType } from '@injectivelabs/sdk-ui-ts'

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
  AuctionCountdown = 'auction-countdown',
  Connect = 'connect',
  DelegateToValidator = 'delegate-to-validator',
  GasFeeRebate = 'gas-fee-rebate',
  MarketRewardFactors = 'market-reward-factors',
  OrderConfirm = 'order-confirm',
  Terms = 'terms',
  MarketBeta = 'market-beta',
  MarketNew = 'market-new',
  MarketDeprecated = 'market-deprecated',
  Bridge = 'bridge',
  BridgeConfirm = 'bridge-confirm',
  BridgeCompleted = 'bridge-completed',
  RefereeOnboarding = 'referee-onboarding',
  InsufficientInjForGas = 'insufficient-inj-for-gas',
  MobileTradeFilter = 'mobile-trade-filter',
  MobileTradeDetails = 'mobile-trade-details'
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
  USDT = 'usdt'
  // UST = 'ust'
}

export enum MarketTypeFavorite {
  Favorite = 'Favorite'
}

export enum StreamType {
  SubaccountBalances = 'subaccount-balances',
  SpotSubaccountOrders = 'spot-subaccount-orders',
  SpotSubaccountTrades = 'spot-subaccount-trades',
  DerivativesSubaccountOrders = 'derivatives-subaccount-orders',
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

export { MarketType }
