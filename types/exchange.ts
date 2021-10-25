import {
  FeeDiscountTierInfo,
  FeeDiscountSchedule,
  PointsMultiplier,
  TradingRewardCampaignBoostInfo,
  TradingRewardCampaignInfo,
  CampaignRewardPool
} from '@injectivelabs/chain-consumer'

export interface FeeDiscountAccountInfo {
  tierLevel: number
  accountInfo: FeeDiscountTierInfo | undefined
}

export interface TradingRewardsCampaign {
  tradingRewardCampaignInfo: TradingRewardCampaignInfo | undefined
  tradingRewardPoolCampaignScheduleList: CampaignRewardPool[]
  totalTradeRewardPoints: string
}

export {
  FeeDiscountTierInfo,
  FeeDiscountSchedule,
  PointsMultiplier,
  TradingRewardCampaignBoostInfo,
  TradingRewardCampaignInfo,
  CampaignRewardPool
}
