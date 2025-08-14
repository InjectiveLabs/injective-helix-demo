import { BigNumberInBase } from '@injectivelabs/utils'
import type { Ref } from 'vue'
import type { UiMarketWithToken } from '@/types'
import type { PointsMultiplier } from '@injectivelabs/sdk-ts'

export function useTradeReward(market?: Ref<undefined | UiMarketWithToken>) {
  const exchangeStore = useExchangeStore()
  const sharedSpotStore = useSharedSpotStore()
  const sharedDerivativeStore = useSharedDerivativeStore()

  const rewardsCampaign = computed(() => {
    if (!exchangeStore.tradingRewardsCampaign) {
      return undefined
    }

    return exchangeStore.tradingRewardsCampaign
  })

  const campaignInfo = computed(() => {
    if (
      !rewardsCampaign.value ||
      !rewardsCampaign.value.tradingRewardCampaignInfo
    ) {
      return undefined
    }

    return rewardsCampaign.value.tradingRewardCampaignInfo
  })

  const quoteSymbolsList = computed(() => {
    if (!campaignInfo.value) {
      return []
    }

    return campaignInfo.value.quoteSymbolsList
  })

  const poolCampaignScheduleList = computed(() => {
    if (
      !rewardsCampaign.value ||
      !rewardsCampaign.value.tradingRewardPoolCampaignScheduleList
    ) {
      return undefined
    }

    return rewardsCampaign.value.tradingRewardPoolCampaignScheduleList
  })

  const pendingPoolCampaignScheduleList = computed(() => {
    if (
      !rewardsCampaign.value ||
      !rewardsCampaign.value.pendingTradingRewardPoolCampaignScheduleList
    ) {
      return undefined
    }

    return rewardsCampaign.value.pendingTradingRewardPoolCampaignScheduleList
  })

  const boostInfo = computed(() => {
    if (!campaignInfo.value || !campaignInfo.value.tradingRewardBoostInfo) {
      return {
        boostedSpotMarketIdsList: [],
        spotMarketMultipliersList: [],
        boostedDerivativeMarketIdsList: [],
        derivativeMarketMultipliersList: []
      }
    }

    return campaignInfo.value.tradingRewardBoostInfo
  })

  const derivativeBoostedMarketIdList = computed(() => {
    return boostInfo.value.boostedDerivativeMarketIdsList || []
  })

  const spotBoostedMarketIdList = computed(() => {
    return boostInfo.value.boostedSpotMarketIdsList || []
  })

  const derivativeBoostedMultiplierList = computed(() => {
    return boostInfo.value.derivativeMarketMultipliersList || []
  })

  const spotBoostedMultiplierList = computed(() => {
    return boostInfo.value.spotMarketMultipliersList || []
  })

  const disqualifiedMarketIdsList = computed(() => {
    if (!campaignInfo.value || !campaignInfo.value.disqualifiedMarketIdsList) {
      return []
    }

    return campaignInfo.value.disqualifiedMarketIdsList
  })

  const isMarketDisqualified = computed(() => {
    if (!market || !market.value) {
      return false
    }

    return disqualifiedMarketIdsList.value.includes(market.value.marketId)
  })

  const marketIncludedInTradingReward = computed(() => {
    if (!market || !market.value) {
      return false
    }

    if (!market || !campaignInfo.value || !campaignInfo.value.quoteDenomsList) {
      return false
    }

    return campaignInfo.value.quoteDenomsList.includes(market.value.quoteDenom)
  })

  const derivativeMarketMakerTakePointsMap = computed(() => {
    if (!boostInfo.value) {
      return {}
    }

    const boostedDerivativeMarketsPointsMap =
      derivativeBoostedMarketIdList.value.reduce(
        (boostedMarkets, marketId, index) => {
          return {
            ...boostedMarkets,
            [marketId]: derivativeBoostedMultiplierList.value[index]
          }
        },
        {} as Record<string, PointsMultiplier>
      )

    const DEFAULT_POINTS_MULTIPLIER = '1000000000000000000'
    const nonBoostedDerivativesMarketsPointsMap = [
      ...sharedDerivativeStore.marketsWithToken
    ]
      .filter(
        (derivativeMarket) =>
          !derivativeBoostedMarketIdList.value.includes(
            derivativeMarket.marketId
          ) &&
          !disqualifiedMarketIdsList.value.includes(derivativeMarket.marketId)
      )
      .reduce((records, market) => {
        return {
          ...records,
          [market.marketId]: {
            makerPointsMultiplier: DEFAULT_POINTS_MULTIPLIER,
            takerPointsMultiplier: DEFAULT_POINTS_MULTIPLIER
          }
        }
      }, {}) as Record<string, PointsMultiplier>

    return {
      ...boostedDerivativeMarketsPointsMap,
      ...nonBoostedDerivativesMarketsPointsMap
    }
  })

  const spotMarketMakerTakePointsMap = computed(() => {
    if (!boostInfo.value) {
      return {}
    }

    const boostedSpotMarketsPointsMap = spotBoostedMarketIdList.value.reduce(
      (boostedMarkets, marketId, index) => {
        return {
          ...boostedMarkets,
          [marketId]: spotBoostedMultiplierList.value[index]
        }
      },
      {} as Record<string, PointsMultiplier>
    )

    const DEFAULT_POINTS_MULTIPLIER = new BigNumberInBase(1).toWei().toFixed()
    const nonBoostedSpotMarketsPointsMap = [...sharedSpotStore.marketsWithToken]
      .filter(
        (spotMarket) =>
          !spotBoostedMarketIdList.value.includes(spotMarket.marketId) &&
          !disqualifiedMarketIdsList.value.includes(spotMarket.marketId)
      )
      .reduce((records, market) => {
        return {
          ...records,
          [market.marketId]: {
            makerPointsMultiplier: DEFAULT_POINTS_MULTIPLIER,
            takerPointsMultiplier: DEFAULT_POINTS_MULTIPLIER
          }
        }
      }, {}) as Record<string, PointsMultiplier>

    return { ...boostedSpotMarketsPointsMap, ...nonBoostedSpotMarketsPointsMap }
  })

  const marketTakerMakerExpectedPts = computed(() => {
    if (!market || !market.value) {
      return undefined
    }

    return {
      ...derivativeMarketMakerTakePointsMap.value,
      ...spotMarketMakerTakePointsMap.value
    }[market.value.marketId]
  })

  return {
    boostInfo,
    campaignInfo,
    rewardsCampaign,
    quoteSymbolsList,
    isMarketDisqualified,
    spotBoostedMarketIdList,
    poolCampaignScheduleList,
    spotBoostedMultiplierList,
    disqualifiedMarketIdsList,
    marketTakerMakerExpectedPts,
    derivativeBoostedMarketIdList,
    pendingPoolCampaignScheduleList,
    derivativeBoostedMultiplierList,
    marketIncludedInTradingReward
  }
}
