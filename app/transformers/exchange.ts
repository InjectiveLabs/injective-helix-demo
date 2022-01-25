import { getTokenMetaData } from '../services/tokens'
import { tokenMetaToToken } from './token'
import {
  BaseFeeDiscountSchedule,
  BaseTradeRewardCampaign,
  TradeRewardCampaign,
  FeeDiscountSchedule
} from '~/types/exchange'
import { Token } from '~/types'

export const feeDiscountScheduleToUiFeeDiscountSchedule = (
  feeDiscountSchedule: BaseFeeDiscountSchedule
): FeeDiscountSchedule => {
  return {
    ...feeDiscountSchedule,
    quoteTokenMeta: feeDiscountSchedule.quoteDenomsList
      .map((denom) => tokenMetaToToken(getTokenMetaData(denom), denom))
      .filter((token) => token) as Token[]
  }
}

export const tradeRewardCampaignToUiTradeRewardCampaign = (
  tradeRewardCampaign: BaseTradeRewardCampaign
): TradeRewardCampaign => {
  const quoteDenomsList = tradeRewardCampaign.tradingRewardCampaignInfo
    ? tradeRewardCampaign.tradingRewardCampaignInfo.quoteDenomsList
    : []
  const tradingRewardCampaignInfo = tradeRewardCampaign.tradingRewardCampaignInfo
    ? {
        ...tradeRewardCampaign.tradingRewardCampaignInfo,
        quoteSymbolsList: (quoteDenomsList
          .map((denom) => tokenMetaToToken(getTokenMetaData(denom), denom))
          .filter((token) => token) as Token[]).map((token) => token.symbol)
      }
    : undefined

  return {
    ...tradeRewardCampaign,
    tradingRewardCampaignInfo
  }
}
