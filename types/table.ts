import {
  Campaign,
  PositionV2,
  TokenStatic,
  SpotLimitOrder,
  SpotOrderHistory,
  DerivativeLimitOrder,
  DerivativeOrderHistory
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SharedUiSpotTrade,
  SharedUiMarketSummary,
  SharedBalanceWithToken,
  SharedUiDerivativeTrade
} from '@shared/types'
import {
  UiSpotMarket,
  UiMarketWithToken,
  UiDerivativeMarket,
  UiSubaccountTransactionWithToken
} from '@/types'

export enum BalanceTableColumn {
  Assets = 'assets',
  Available = 'available',
  UsedOrReserved = 'used-or-reserved',
  UnrealizedPnl = 'unrealized-pnl',
  Total = 'total',
  TotalUsd = 'total-usd',
  Staked = 'staked',
  StakedUsd = 'staked-usd',
  Action = 'action'
}

export enum MarketsTableColumn {
  Markets = 'markets',
  LastPrice = 'last-price',
  MarketChange24h = 'market-change-24h',
  MarketVolume24h = 'market-volume-24h',
  Action = 'action'
}

export enum MarketsSelectorTableColumn {
  Markets = 'markets',
  LastPrice = 'last-price',
  MarketChange24h = 'market-change-24h',
  FundingRate = 'funding-rate',
  MarketVolume24h = 'market-volume-24h'
  // OpenInterest = 'open-interest'
}

export enum LiquidityTableColumn {
  Market = 'market',
  Rewards = 'rewards',
  ActiveBots = 'active-bots',
  Volume = 'volume',
  Action = 'action'
}

export enum LiquidityDashboardTableColumn {
  Market = 'market',
  Volume = 'volume',
  Rewards = 'rewards',
  EstRewards = 'est-rewards',
  Action = 'action'
}

export enum PortfolioSpotOpenOrdersTableColumn {
  Market = 'market',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Unfilled = 'unfilled',
  Filled = 'filled',
  TotalAmount = 'total-amount',
  Chase = 'chase',
  Action = 'action'
}

export enum PortfolioSpotOrderHistoryTableColumn {
  LastUpdated = 'last-updated',
  Market = 'market',
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Total = 'total',
  TriggerCondition = 'trigger-condition',
  Status = 'status'
}

export enum PortfolioSpotTradingBotsRunningTableColumn {
  Time = 'time',
  Market = 'market',
  Details = 'details',
  Duration = 'duration',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit',
  RemoveStrategy = 'removeStrategy'
}

export enum PortfolioSpotTradingBotsHistoryTableColumn {
  Time = 'time',
  Market = 'market',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit',
  Duration = 'duration',
  Details = 'details',
  StopReason = 'stopReason'
}

export enum PortfolioSpotTradeHistoryTableColumn {
  Time = 'time',
  Pair = 'pair',
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Fee = 'fee',
  Total = 'total'
}

export enum PortfolioFuturesOpenOrdersTableColumn {
  Market = 'market',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Unfilled = 'unfilled',
  Filled = 'filled',
  Leverage = 'leverage',
  Total = 'total',
  Chase = 'chase',
  Action = 'action'
}

export enum PortfolioFuturesAdvancedOrdersTableColumn {
  Market = 'market',
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Leverage = 'leverage',
  Total = 'total',
  TriggerCondition = 'trigger-condition',
  Action = 'action'
}

export enum PortfolioFuturesOrderHistoryTableColumn {
  LastUpdated = 'last-updated',
  Market = 'market',
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Total = 'total',
  TriggerCondition = 'trigger-condition',
  Status = 'status'
}

export enum PortfolioFuturesTradeHistoryTableColumn {
  Time = 'time',
  Market = 'market',
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Amount = 'amount',
  Fee = 'fee',
  Total = 'total'
}

export enum PortfolioSubaccountsTableColumn {
  Name = 'name',
  Address = 'address',
  TotalUsd = 'total-usd'
}

export enum FundingHistoryTableColumn {
  Time = 'time',
  Pair = 'pair',
  Payment = 'payment'
}

export enum HistoryWalletTableColumn {
  Time = 'time',
  Type = 'type',
  Asset = 'asset',
  Amount = 'amount',
  Origin = 'origin',
  Destination = 'destination'
}

export enum HistorySwapTableColumn {
  Time = 'time',
  Outgoing = 'outgoing',
  Incoming = 'incoming',
  Route = 'route',
  Fee = 'fee',
  Action = 'action'
}

export enum PositionTableColumn {
  Market = 'market',
  Side = 'side',
  Contracts = 'contracts',
  Entry = 'entry',
  Mark = 'mark',
  UnrealizedPnl = 'unrealized-pnl',
  TotalUsd = 'total-usd',
  Margin = 'margin',
  LiquidationPrice = 'liquidation-price',
  Leverage = 'leverage',
  TpOrSl = 'tp-or-sl',
  ClosePosition = 'close-position'
}

export interface UTableColumn {
  key: string
  label?: string
  class?: string
}

export interface TransformedBalances {
  token: TokenStatic
  isVerified: boolean
  isBridgable: boolean
  isStakingRow: boolean
  hasNoActionButtons: boolean
  [BalanceTableColumn.Total]: BigNumberInBase
  [BalanceTableColumn.TotalUsd]: BigNumberInBase
  [BalanceTableColumn.Available]: BigNumberInBase
  [BalanceTableColumn.UnrealizedPnl]: BigNumberInBase
  [BalanceTableColumn.UsedOrReserved]: BigNumberInBase
}

export interface TransformedMarkets {
  isVerified: boolean
  isRwaMarket: boolean
  formattedChange: string
  market: UiMarketWithToken
  priceChangeClasses: string
  volumeInUsd: BigNumberInBase
  summary: SharedUiMarketSummary
  [MarketsTableColumn.LastPrice]: number
  [MarketsTableColumn.MarketChange24h]: number
  [MarketsTableColumn.MarketVolume24h]: number
  [MarketsTableColumn.Markets]: string
}

export interface TransformedMarketsSelector {
  isRWAMarket: boolean
  formattedChange: string
  leverageToFixed: string
  leverage: BigNumberInBase
  market: UiMarketWithToken
  volumeInUsdToFixed: string
  priceChangeClasses: string
  volumeInUsd: BigNumberInBase
  [MarketsSelectorTableColumn.MarketVolume24h]: number
  [MarketsSelectorTableColumn.Markets]: string
  [MarketsSelectorTableColumn.LastPrice]: string
  [MarketsSelectorTableColumn.FundingRate]: BigNumberInBase
  // [MarketsSelectorTableColumn.OpenInterest]: BigNumberInBase
  [MarketsSelectorTableColumn.MarketChange24h]: string
}

export interface TransformedHistorySwap {
  txHash: string
  explorerLink: string
  routeSymbols: string[]
  sourceBalanceFormatted: string
  destinationBalanceFormatted: string
  formattedFees: Array<Record<string, string>>
  sourceTokenWithBalance: SharedBalanceWithToken | null | undefined
  destinationTokenWithBalance: SharedBalanceWithToken | null | undefined
  [HistorySwapTableColumn.Time]: string
}

export interface TransformedHistoryWallet {
  transferType: string
  formattedOrigin: string
  formattedDestination: string
  transaction: UiSubaccountTransactionWithToken
  [HistoryWalletTableColumn.Time]: string
  [HistoryWalletTableColumn.Amount]: BigNumberInBase
}

export interface TransformedFundingHistory {
  time: string
  total: BigNumberInBase
  market: UiDerivativeMarket
}

export interface TransformedLiquidity {
  campaignId: string
  baseToken: TokenStatic
  totalRewardsInUsd: BigNumberInBase
  marketVolumeInUsd: BigNumberInBase
  userHasActiveLegacyStrategy: boolean
  rewardsWithToken: { value: string; token: TokenStatic | undefined }[]
  [LiquidityTableColumn.Market]: UiSpotMarket
}

export interface TransformedLiquidityDashboard {
  campaign: Campaign
  token: TokenStatic
  campaignId: string
  totalAmountInUsd: BigNumberInBase
  marketVolumeInUsd: BigNumberInBase
  [LiquidityDashboardTableColumn.Rewards]: {
    amount: BigNumberInBase
    symbol: string
    amountInUsd: BigNumberInBase
  }[]
  [LiquidityDashboardTableColumn.Market]: UiSpotMarket
}

export interface TransformedPosition {
  pnl: BigNumberInBase
  position: PositionV2
  priceDecimals: number
  price: BigNumberInBase
  quantityDecimals: number
  quantity: BigNumberInBase
  markPrice: BigNumberInBase
  hasReduceOnlyOrders: boolean
  percentagePnl: BigNumberInBase
  quantityInUsd: BigNumberInBase
  isLimitOrderAuthorized: boolean
  isMarketOrderAuthorized: boolean
  liquidationPrice: BigNumberInBase
  effectiveLeverage: BigNumberInBase
  reduceOnlyCurrentOrders: DerivativeLimitOrder[]
  [PositionTableColumn.Margin]: BigNumberInBase
  [PositionTableColumn.Market]: UiDerivativeMarket
}

export interface TransformedPortfolioSpotOpenOrders {
  isBuy: boolean
  order: SpotLimitOrder
  isAuthorized: boolean
  priceDecimals: number
  total: BigNumberInBase
  orderFillable: boolean
  quantityDecimals: number
  quantity: BigNumberInBase
  highestBid: BigNumberInBase
  accountQuoteBalance: string
  insufficientBalance: boolean
  filledQuantity: BigNumberInBase
  chaseTotalQuote: BigNumberInBase
  orderTotalQuote: BigNumberInBase
  unfilledQuantity: BigNumberInBase
  chaseBalanceNeeded: BigNumberInBase
  filledQuantityPercentageToFormat: string
  [PortfolioSpotOpenOrdersTableColumn.Market]: UiSpotMarket
  [PortfolioSpotOpenOrdersTableColumn.Price]: BigNumberInBase
}

export interface TransformedPortfolioSpotOrderHistory {
  isBuy: boolean
  timestamp: string
  orderStatus: string
  priceDecimals: number
  order: SpotOrderHistory
  quantityDecimals: number
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  [PortfolioSpotOrderHistoryTableColumn.Type]: string
  [PortfolioSpotOrderHistoryTableColumn.Market]: UiSpotMarket
  [PortfolioSpotOrderHistoryTableColumn.Total]: BigNumberInBase
  [PortfolioSpotOrderHistoryTableColumn.Price]: BigNumberInBase
}

export interface TransformedPortfolioSpotTradeHistory {
  market: UiSpotMarket
  priceDecimals: number
  trade: SharedUiSpotTrade
  quantityDecimals: number
  quantity: BigNumberInBase
  tradeExecutionType: string
  [PortfolioSpotTradeHistoryTableColumn.Time]: string
  [PortfolioSpotTradeHistoryTableColumn.Fee]: BigNumberInBase
  [PortfolioSpotTradeHistoryTableColumn.Price]: BigNumberInBase
  [PortfolioSpotTradeHistoryTableColumn.Total]: BigNumberInBase
}

export interface TransformedPortfolioFuturesOpenOrders {
  isBuy: boolean
  isReduceOnly: boolean
  isAuthorized: boolean
  priceDecimals: number
  quantityDecimals: number
  quantity: BigNumberInBase
  order: DerivativeLimitOrder
  accountQuoteBalance: string
  insufficientBalance: boolean
  newChasePrice: BigNumberInBase
  newChaseMargin: BigNumberInBase
  filledQuantity: BigNumberInBase
  unfilledQuantity: BigNumberInBase
  chaseBalanceNeeded: BigNumberInBase
  [PortfolioFuturesOpenOrdersTableColumn.Price]: BigNumberInBase
  [PortfolioFuturesOpenOrdersTableColumn.Total]: BigNumberInBase
  [PortfolioFuturesOpenOrdersTableColumn.Leverage]: BigNumberInBase
  [PortfolioFuturesOpenOrdersTableColumn.Market]: UiDerivativeMarket
}

export interface TransformedPortfolioFuturesOrderHistory {
  isBuy: boolean
  timestamp: string
  isStopLoss: boolean
  orderStatus: string
  isReduceOnly: boolean
  isTakeProfit: boolean
  priceDecimals: number
  isMarketOrder: boolean
  quantityDecimals: number
  quantity: BigNumberInBase
  order: DerivativeOrderHistory
  triggerPrice: BigNumberInBase
  [PortfolioFuturesOrderHistoryTableColumn.Type]: string
  [PortfolioFuturesOrderHistoryTableColumn.Total]: BigNumberInBase
  [PortfolioFuturesOrderHistoryTableColumn.Price]: BigNumberInBase
  [PortfolioFuturesOrderHistoryTableColumn.Market]: UiDerivativeMarket
}

export interface TransformedPortfolioFuturesTradeHistory {
  priceDecimals: number
  quantityDecimals: number
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  tradeExecutionType: string
  trade: SharedUiDerivativeTrade
  [PortfolioFuturesTradeHistoryTableColumn.Time]: string
  [PortfolioFuturesTradeHistoryTableColumn.Fee]: BigNumberInBase
  [PortfolioFuturesTradeHistoryTableColumn.Total]: BigNumberInBase
  [PortfolioFuturesTradeHistoryTableColumn.Price]: BigNumberInBase
}

export interface TransformedPortfolioFuturesAdvancedOrders {
  isBuy: boolean
  isStopLoss: boolean
  isReduceOnly: boolean
  isTakeProfit: boolean
  isAuthorized: boolean
  priceDecimals: number
  isCancelable: boolean
  isMarketOrder: boolean
  quantityDecimals: number
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  trigger: DerivativeOrderHistory
  [PortfolioFuturesAdvancedOrdersTableColumn.Type]: string
  [PortfolioFuturesAdvancedOrdersTableColumn.Total]: BigNumberInBase
  [PortfolioFuturesAdvancedOrdersTableColumn.Price]: BigNumberInBase
  [PortfolioFuturesAdvancedOrdersTableColumn.Leverage]: BigNumberInBase
  [PortfolioFuturesAdvancedOrdersTableColumn.Market]: UiDerivativeMarket
}

export interface TransformedPointsHistory {
  points: string
  volume: number
  period: string
  pointsInBigNumber: BigNumberInBase
  volumeInBigNumber: BigNumberInBase
}

export enum PortfolioTradingBotsRunningTableColumn {
  Time = 'time',
  Market = 'market',
  Details = 'details',
  Duration = 'duration',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit',
  RemoveStrategy = 'removeStrategy'
}

export enum PortfolioTradingBotsHistoryTableColumn {
  Time = 'time',
  Market = 'market',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit',
  Duration = 'duration',
  Details = 'details',
  StopReason = 'stopReason'
}
