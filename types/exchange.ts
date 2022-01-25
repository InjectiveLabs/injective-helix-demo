import {
  FeeDiscountTierInfo,
  FeeDiscountTierTTL,
  FeeDiscountAccountInfo,
  PointsMultiplier,
  TradingRewardCampaignBoostInfo,
  TradingRewardCampaignInfo as BaseTradingRewardCampaignInfo,
  TradeRewardCampaign as BaseTradeRewardCampaign,
  CampaignRewardPool,
  FeeDiscountSchedule as BaseFeeDiscountSchedule
} from '@injectivelabs/chain-consumer'
import { Token } from '.'

export interface FeeDiscountSchedule extends BaseFeeDiscountSchedule {
  quoteTokenMeta: Token[]
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
  CampaignRewardPool
}
