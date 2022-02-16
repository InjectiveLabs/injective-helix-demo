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
  SubaccountDepositWithSelect = 'subaccount-deposit-with-select',
  Terms = 'terms',
  MarketBeta = 'market-beta',
  Bridge = 'bridge'
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

export enum tradeTypes {
  Limit = 'limit',
  Market = 'market'
}

export enum tradeSides {
  Buy = 'buy',
  Sell = 'sell'
}
