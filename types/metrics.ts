export enum AccountMetrics {
  FetchPortfolioValue = 'PortfolioValueRequest',
  FetchSubaccount = 'SubaccountsListRequest',
  FetchSubaccountBalances = 'SubaccountBalancesListRequest',
  FetchSubaccountHistory = 'SubaccountHistoryRequest',
  Deposit = 'MsgDeposit',
  Withdraw = 'MsgWithdraw',
  SendToEth = 'MsgSendToEth',
  Send = 'MsgSend'
}

export enum ChainMetrics {
  FetchBalances = 'QueryAllBalancesRequest',
  FetchBalance = 'QueryBalanceRequest'
}

export enum DerivativesMetrics {
  FetchMarkets = 'DerivativeMarketsRequest',
  FetchMarket = 'DerivativeMarketRequest',
  FetchOrderbook = 'DerivativeOrderbookRequest',
  FetchTrades = 'DerivativeTradesRequest',
  FetchOrders = 'DerivativeOrdersRequest',
  FetchPositions = 'DerivativePositionsRequest',
  FetchMarketSummary = 'DerivativeChronosMarketSummary',
  FetchMarketsSummary = 'DerivativeChronosMarketsSummary',
  CreateLimitOrder = 'MsgCreateDerivativeLimitOrder',
  CreateMarketOrder = 'MsgCreateDerivativeMarketOrder',
  CancelLimitOrder = 'MsgCancelDerivativeOrder',
  BatchCancelLimitOrders = 'MsgBatchCancelDerivativeOrders'
}

export enum SpotMetrics {
  FetchMarkets = 'SpotMarketsRequest',
  FetchMarket = 'SpotMarketRequest',
  FetchOrderbook = 'SpotOrderbookRequest',
  FetchTrades = 'SpotTradesRequest',
  FetchOrders = 'SpotOrdersRequest',
  FetchPositions = 'SpotPositionsRequest',
  FetchMarketSummary = 'SpotChronosMarketSummary',
  FetchMarketsSummary = 'SpotChronosMarketsSummary',
  CreateLimitOrder = 'MsgCreateSpotLimitOrder',
  CreateMarketOrder = 'MsgCreateSpotMarketOrder',
  CancelLimitOrder = 'MsgCancelSpotOrder',
  BatchCancelLimitOrders = 'MsgBatchCancelSpotOrders'
}
