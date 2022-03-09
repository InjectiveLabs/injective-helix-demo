import {
  FeeDiscountTierInfo,
  FeeDiscountTierTTL,
  FeeDiscountAccountInfo,
  PointsMultiplier,
  ExchangeParams,
  TradingRewardCampaignBoostInfo,
  TradingRewardCampaignInfo as BaseTradingRewardCampaignInfo,
  TradeRewardCampaign as BaseTradeRewardCampaign,
  CampaignRewardPool,
  FeeDiscountSchedule as BaseFeeDiscountSchedule
} from '@injectivelabs/chain-consumer'
import { Token } from '@injectivelabs/ui-common'

export interface FeeDiscountSchedule extends BaseFeeDiscountSchedule {
  //
}

export interface FeeDiscountScheduleWithToken extends FeeDiscountSchedule {
  quoteToken: Token[]
}

export interface TradingRewardCampaignInfo
  extends BaseTradingRewardCampaignInfo {
  quoteSymbolsList: string[]
}

export interface TradeRewardCampaign extends BaseTradeRewardCampaign {
  tradingRewardCampaignInfo: TradingRewardCampaignInfo | undefined
}

export interface TradingRewardsCampaign extends TradeRewardCampaign {
  //
}

export {
  FeeDiscountTierTTL,
  FeeDiscountAccountInfo,
  FeeDiscountTierInfo,
  PointsMultiplier,
  BaseFeeDiscountSchedule,
  BaseTradeRewardCampaign,
  BaseTradingRewardCampaignInfo,
  TradingRewardCampaignBoostInfo,
  CampaignRewardPool,
  ExchangeParams
}
