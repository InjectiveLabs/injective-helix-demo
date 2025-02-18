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
  Total = 'total',
  Action = 'action',
  Assets = 'assets',
  Staked = 'staked',
  TotalUsd = 'total-usd',
  Available = 'available',
  StakedUsd = 'staked-usd',
  UnrealizedPnl = 'unrealized-pnl',
  UsedOrReserved = 'used-or-reserved'
}

export enum MarketsTableColumn {
  Action = 'action',
  Markets = 'markets',
  LastPrice = 'last-price',
  MarketChange24h = 'market-change-24h',
  MarketVolume24h = 'market-volume-24h'
}

export enum MarketsSelectorTableColumn {
  Markets = 'markets',
  LastPrice = 'last-price',
  FundingRate = 'funding-rate',
  // OpenInterest = 'open-interest',
  MarketVolume24h = 'market-volume-24h',
  MarketChange24h = 'market-change-24h'
}

export enum LiquidityTableColumn {
  Action = 'action',
  Market = 'market',
  Volume = 'volume',
  Rewards = 'rewards',
  ActiveBots = 'active-bots'
}

export enum LiquidityDashboardTableColumn {
  Action = 'action',
  Market = 'market',
  Volume = 'volume',
  Rewards = 'rewards',
  EstRewards = 'est-rewards'
}

export enum PortfolioSpotOpenOrdersTableColumn {
  Side = 'side',
  Price = 'price',
  Chase = 'chase',
  Action = 'action',
  Market = 'market',
  Amount = 'amount',
  Filled = 'filled',
  Unfilled = 'unfilled',
  TotalAmount = 'total-amount'
}

export enum PortfolioSpotOrderHistoryTableColumn {
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Total = 'total',
  Status = 'status',
  Market = 'market',
  Amount = 'amount',
  LastUpdated = 'last-updated',
  TriggerCondition = 'trigger-condition'
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
  Details = 'details',
  Duration = 'duration',
  StopReason = 'stopReason',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit'
}

export enum PortfolioSpotTradeHistoryTableColumn {
  Fee = 'fee',
  Time = 'time',
  Pair = 'pair',
  Type = 'type',
  Side = 'side',
  Total = 'total',
  Price = 'price',
  Amount = 'amount'
}

export enum PortfolioFuturesOpenOrdersTableColumn {
  Side = 'side',
  Price = 'price',
  Total = 'total',
  Chase = 'chase',
  Action = 'action',
  Market = 'market',
  Amount = 'amount',
  Filled = 'filled',
  Unfilled = 'unfilled',
  Leverage = 'leverage'
}

export enum PortfolioFuturesAdvancedOrdersTableColumn {
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Total = 'total',
  Action = 'action',
  Market = 'market',
  Amount = 'amount',
  Leverage = 'leverage',
  TriggerCondition = 'trigger-condition'
}

export enum PortfolioFuturesOrderHistoryTableColumn {
  Type = 'type',
  Side = 'side',
  Price = 'price',
  Total = 'total',
  Status = 'status',
  Market = 'market',
  Amount = 'amount',
  LastUpdated = 'last-updated',
  TriggerCondition = 'trigger-condition'
}

export enum PortfolioFuturesTradeHistoryTableColumn {
  Fee = 'fee',
  Time = 'time',
  Type = 'type',
  Side = 'side',
  Total = 'total',
  Price = 'price',
  Market = 'market',
  Amount = 'amount'
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
  Fee = 'fee',
  Time = 'time',
  Route = 'route',
  Action = 'action',
  Outgoing = 'outgoing',
  Incoming = 'incoming'
}

export enum PositionTableColumn {
  Side = 'side',
  Mark = 'mark',
  Entry = 'entry',
  Market = 'market',
  Margin = 'margin',
  TpOrSl = 'tp-or-sl',
  Leverage = 'leverage',
  TotalUsd = 'total-usd',
  Contracts = 'contracts',
  ClosePosition = 'close-position',
  UnrealizedPnl = 'unrealized-pnl',
  LiquidationPrice = 'liquidation-price'
}

export enum ReferralTableColumn {
  Wallets = 'wallets',
  JoinDate = 'join-date',
  Commission = 'commission'
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
  Details = 'details',
  Duration = 'duration',
  StopReason = 'stopReason',
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound',
  TotalAmount = 'totalAmount',
  TotalProfit = 'totalProfit'
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
  subaccountId: string
  priceDecimals: number
  price: BigNumberInBase
  quantityDecimals: number
  quantity: BigNumberInBase
  markPrice: BigNumberInBase
  hasActiveStrategy: boolean
  hasReduceOnlyOrders: boolean
  percentagePnl: BigNumberInBase
  quantityInUsd: BigNumberInBase
  isLimitOrderAuthorized: boolean
  isTradingBotSubaccount: boolean
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
