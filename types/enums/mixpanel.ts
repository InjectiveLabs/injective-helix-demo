export enum MixPanelStatus {
  Error = 'Error',
  Success = 'Success'
}

export enum MixPanelEvent {
  SwapClicked = 'Swap Clicked',
  OnramperSeen = 'OnRamper Seen',
  WalletConnected = 'Wallet Connected',
  QrCodePageView = 'QR Code Page View',
  QrCodeBuyFunds = 'QR Code Buy Funds',
  OnramperSuccess = 'OnRamper Success',
  TradingBotError = 'Trading Bot Error',
  RefereeLoggedIn = 'Referee Logged In',
  PlaceOrderClicked = 'Place Order Clicked',
  LiteBridgeBridged = 'Lite Bridge Bridged',
  AutoSignCTAPopUp = 'Auto Sign CTA Pop Up',
  SharePnlDownloaded = 'Share PnL Downloaded',
  AutoSignCTAEnabled = 'Auto Sign CTA Enabled',
  LiteBridgePageView = 'Lite Bridge Page View',
  ReferralCodeCreated = 'Referral Code Created',
  UtmStockTwitsToast = 'Utm - Stock Twits Toast',
  UtmStockTwitsBanner = 'Utm - Stock Twits Banner',
  ChangeSelectedLanguage = 'Change Selected Language',
  InitialSelectedLanguage = 'Initial Selected Language',
  EndGridTradingBotClicked = 'End Grid Trading Bot Clicked',
  OnboardingUserDoesntTrade = 'Onboarding - User Doesnt Trade',
  CreateGridTradingBotClicked = 'Create Grid Trading Bot Clicked',
  OnboardingUserWithNoAssets = 'Onboarding - User With No Assets',
  OnboardingUserBecomeReferee = 'Onboarding - User Become Referee',
  OnboardingWalletEmptyWithEvmAssets = 'Onboarding - Wallet Empty With EVM Assets'
}

export enum MixPanelCounter {
  SwapCount = 'Swap Count',
  CreateOrderCount = 'Create Order Count',
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
  Limit = 'Limit',
  Market = 'Market',
  StopLimit = 'Stop Limit',
  StopMarket = 'Stop Market'
}
