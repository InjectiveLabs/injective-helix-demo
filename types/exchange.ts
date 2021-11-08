import {
  FeeDiscountTierInfo,
  PointsMultiplier,
  TradingRewardCampaignBoostInfo,
  TradingRewardCampaignInfo as BaseTradingRewardCampaignInfo,
  CampaignRewardPool,
  FeeDiscountSchedule as BaseFeeDiscountSchedule
} from '@injectivelabs/chain-consumer'
import { Token } from '.'

export interface FeeDiscountSchedule extends BaseFeeDiscountSchedule {
  quoteTokenMeta: Token[]
}

export interface FeeDiscountAccountInfo {
  tierLevel: number
  accountInfo: FeeDiscountTierInfo | undefined
}

export interface TradingRewardCampaignInfo
  extends BaseTradingRewardCampaignInfo {
  quoteSymbolsList: string[]
}

export interface TradingRewardsCampaign {
  tradingRewardCampaignInfo: TradingRewardCampaignInfo | undefined
  tradingRewardPoolCampaignScheduleList: CampaignRewardPool[]
  totalTradeRewardPoints: string
}

export {
  FeeDiscountTierInfo,
  PointsMultiplier,
  BaseFeeDiscountSchedule,
  BaseTradingRewardCampaignInfo,
  TradingRewardCampaignBoostInfo,
  CampaignRewardPool
}
