export enum MixPanelStatus {
  Success = 'Success',
  Error = 'Error'
}

export enum MixPanelEvent {
  SwapClicked = 'Swap Clicked',
  OnramperSeen = 'OnRamper Seen',
  WalletConnected = 'Wallet Connected',
  QrCodePageView = 'QR Code Page View',
  QrCodeBuyFunds = 'QR Code Buy Funds',
  OnramperSuccess = 'OnRamper Success',
  TradingBotError = 'Trading Bot Error',
  PlaceOrderClicked = 'Place Order Clicked',
  LiteBridgeBridged = 'Lite Bridge Bridged',
  LiteBridgePageView = 'Lite Bridge Page View',
  EndGridTradingBotClicked = 'End Grid Trading Bot Clicked',
  CreateGridTradingBotClicked = 'Create Grid Trading Bot Clicked'
}

export enum MixPanelCounter {
  CreateOrderCount = 'Create Order Count',
  SwapCount = 'Swap Count',
  CreateStrategyCount = 'Create Strategy Count'
}

export enum MixPanelStrategyPage {
  TradingPage = 'Trading Page',
  LiquidityPage = 'Liquidity Page'
}

export enum MixPanelOrderSide {
  Buy = 'Buy',
  Sell = 'Sell'
}

export enum MixPanelOrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopMarket = 'Stop Market',
  StopLimit = 'Stop Limit'
}
