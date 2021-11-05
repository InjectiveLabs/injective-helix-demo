import { ExchangeTransformer } from '@injectivelabs/chain-consumer'
import { exchangeConsumer } from '~/app/singletons/ExchangeConsumer'
import {
  feeDiscountScheduleToUiFeeDiscountSchedule,
  tradingRewardCampaignInfoToUiTradingRewardCampaignInfo
} from '~/app/transformers/exchange'

export const fetchFeeDiscountSchedule = async () => {
  const feeDiscountSchedule = await exchangeConsumer.fetchFeeDiscountSchedule()

  if (!feeDiscountSchedule) {
    return
  }

  return feeDiscountScheduleToUiFeeDiscountSchedule(
    ExchangeTransformer.grpcFeeDiscountScheduleToFeeDiscountSchedule(
      feeDiscountSchedule
    )
  )
}

export const fetchFeeDiscountAccountInfo = async (injectiveAddress: string) => {
  const feeDiscountAccountInfo = await exchangeConsumer.fetchFeeDiscountAccountInfo(
    injectiveAddress
  )

  if (!feeDiscountAccountInfo) {
    return
  }

  return {
    tierLevel: feeDiscountAccountInfo.getTierLevel(),
    accountInfo: feeDiscountAccountInfo.hasAccountInfo()
      ? ExchangeTransformer.grpcFeeDiscountTierInfoToFeeDiscountTierInfo(
          feeDiscountAccountInfo.getAccountInfo()!
        )
      : undefined
  }
}

export const fetchTradingRewardsCampaign = async () => {
  const tradingRewardsCampaign = await exchangeConsumer.fetchTradingRewardsCampaign()

  if (!tradingRewardsCampaign) {
    return
  }

  const tradingRewardsCampaignInfo = tradingRewardsCampaign.getTradingRewardCampaignInfo()

  return {
    tradingRewardCampaignInfo: tradingRewardsCampaignInfo
      ? tradingRewardCampaignInfoToUiTradingRewardCampaignInfo(
          ExchangeTransformer.grpcTradingRewardCampaignInfoToTradingRewardCampaignInfo(
            tradingRewardsCampaignInfo
          )
        )
      : undefined,
    tradingRewardPoolCampaignScheduleList: tradingRewardsCampaign
      .getTradingRewardPoolCampaignScheduleList()
      .map(ExchangeTransformer.grpcCampaignRewardPoolToCampaignRewardPool),
    totalTradeRewardPoints: tradingRewardsCampaign.getTotalTradeRewardPoints()
  }
}

export const fetchTradeRewardPoints = async (injectiveAddress: string[]) => {
  return await exchangeConsumer.fetchTradeRewardPoints(injectiveAddress)
}
