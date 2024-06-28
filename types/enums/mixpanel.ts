export enum MixPanelStatus {
  Success = 'Success',
  Error = 'Error'
}

export enum MixPanelEvent {
  WalletConnected = 'Wallet Connected',
  PlaceOrderClicked = 'Place Order Clicked',
  SwapClicked = 'Swap Clicked',
  CreateGridTradingBotClicked = 'Create Grid Trading Bot Clicked',
  EndGridTradingBotClicked = 'End Grid Trading Bot Clicked'
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
