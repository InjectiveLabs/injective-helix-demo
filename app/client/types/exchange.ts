import {
  TradingRewardCampaignInfo as BaseTradingRewardCampaignInfo,
  TradeRewardCampaign as BaseTradeRewardCampaign,
  FeeDiscountSchedule as BaseFeeDiscountSchedule
} from '@injectivelabs/sdk-ts/'
import { TokenStatic } from '@injectivelabs/token-metadata'

export type FeeDiscountSchedule = BaseFeeDiscountSchedule

export interface FeeDiscountScheduleWithToken extends FeeDiscountSchedule {
  quoteToken: TokenStatic[]
}

export interface TradingRewardCampaignInfo
  extends BaseTradingRewardCampaignInfo {
  quoteSymbolsList: string[]
}

export interface TradeRewardCampaign extends BaseTradeRewardCampaign {
  tradingRewardCampaignInfo: TradingRewardCampaignInfo | undefined
}

export type TradingRewardsCampaign = TradeRewardCampaign
