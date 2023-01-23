import {
  TradingRewardCampaignInfo as BaseTradingRewardCampaignInfo,
  TradeRewardCampaign as BaseTradeRewardCampaign,
  FeeDiscountSchedule as BaseFeeDiscountSchedule
} from '@injectivelabs/sdk-ts/'
import { Token } from '@injectivelabs/token-metadata'

export type FeeDiscountSchedule = BaseFeeDiscountSchedule

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

export type TradingRewardsCampaign = TradeRewardCampaign
