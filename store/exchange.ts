import { defineStore } from 'pinia'
import {
  TokenStatic,
  ExchangeParams,
  FeeDiscountSchedule,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import { SharedUiMarketHistory } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedGetToken } from '@shared/utils/helper'
import { toUiMarketHistory } from '@shared/transformer/market'
import { exchangeApi, indexerRestMarketChronosApi } from '@shared/Service'
import { TradingRewardsCampaign } from '@/app/client/types/exchange'

type ExchangeStoreState = {
  params?: ExchangeParams
  feeDiscountSchedule?: FeeDiscountSchedule
  feeDiscountAccountInfo?: FeeDiscountAccountInfo
  tradingRewardsCampaign?: TradingRewardsCampaign
  tradeRewardsPoints: string[]
  pendingTradeRewardsPoints: string[]
  marketsHistory: SharedUiMarketHistory[]
}

const initialStateFactory = (): ExchangeStoreState => ({
  params: undefined,
  feeDiscountSchedule: undefined,
  feeDiscountAccountInfo: undefined,
  tradingRewardsCampaign: undefined,
  tradeRewardsPoints: [],
  pendingTradeRewardsPoints: [],
  marketsHistory: []
})

export const useExchangeStore = defineStore('exchange', {
  state: (): ExchangeStoreState => initialStateFactory(),

  actions: {
    async initFeeDiscounts() {
      const exchangeStore = useExchangeStore()

      await exchangeStore.fetchFeeDiscountAccountInfo()
    },

    async initTradeAndEarn() {
      const exchangeStore = useExchangeStore()

      await exchangeStore.fetchTradeRewardPoints()
      await exchangeStore.fetchPendingTradeRewardPoints()
    },

    async fetchParams() {
      const exchangeStore = useExchangeStore()

      exchangeStore.$patch({
        params: await exchangeApi.fetchModuleParams()
      })
    },

    async fetchFeeDiscountSchedule() {
      const exchangeStore = useExchangeStore()

      const feeDiscountSchedule = await exchangeApi.fetchFeeDiscountSchedule()

      if (feeDiscountSchedule) {
        const quoteTokenMeta = (await Promise.all(
          feeDiscountSchedule.quoteDenomsList.map(
            async (denom) => await sharedGetToken(denom)
          )
        )) as TokenStatic[]

        const feeDiscountScheduleWithToken = {
          ...feeDiscountSchedule,
          quoteTokenMeta
        } as FeeDiscountSchedule

        exchangeStore.$patch({
          feeDiscountSchedule: {
            ...feeDiscountScheduleWithToken,
            tierInfosList: [
              {
                volume: '0',
                stakedAmount: '0',
                makerDiscountRate: '0',
                takerDiscountRate: '0'
              },
              ...feeDiscountScheduleWithToken.tierInfosList
            ]
          }
        })
      }
    },

    async fetchFeeDiscountAccountInfo() {
      const exchangeStore = useExchangeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const feeDiscountAccountInfo =
        await exchangeApi.fetchFeeDiscountAccountInfo(
          sharedWalletStore.authZOrInjectiveAddress
        )

      if (feeDiscountAccountInfo) {
        exchangeStore.$patch({
          feeDiscountAccountInfo
        })
      }
    },

    async fetchTradingRewardsCampaign() {
      const exchangeStore = useExchangeStore()

      const tradingRewardsCampaign =
        await exchangeApi.fetchTradingRewardsCampaign()

      if (!tradingRewardsCampaign) {
        return
      }

      const quoteDenomsList = tradingRewardsCampaign.tradingRewardCampaignInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList
        : []
      const quoteSymbolsList = (
        (
          await Promise.all(
            quoteDenomsList.map(async (denom) => await sharedGetToken(denom))
          )
        ).filter((token) => token) as TokenStatic[]
      ).map((token) => token.symbol)

      const tradingRewardCampaignInfo = {
        ...tradingRewardsCampaign.tradingRewardCampaignInfo,
        quoteSymbolsList
      }
      const tradingRewardsCampaignWithToken = {
        ...tradingRewardsCampaign,
        tradingRewardCampaignInfo
      } as TradingRewardsCampaign

      exchangeStore.$patch({
        tradingRewardsCampaign: tradingRewardsCampaignWithToken
      })
    },

    async fetchTradeRewardPoints() {
      const exchangeStore = useExchangeStore()

      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      exchangeStore.$patch({
        tradeRewardsPoints: await exchangeApi.fetchTradeRewardPoints([
          sharedWalletStore.authZOrInjectiveAddress
        ])
      })
    },

    async fetchPendingTradeRewardPoints() {
      const exchangeStore = useExchangeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const { params, tradingRewardsCampaign } = exchangeStore

      if (!params || !tradingRewardsCampaign) {
        return
      }

      const pendingRewardsList =
        tradingRewardsCampaign.pendingTradingRewardPoolCampaignScheduleList

      if (pendingRewardsList.length === 0) {
        return
      }

      const rewards = await Promise.all(
        pendingRewardsList.map(async (pendingReward) => {
          const rewards = await exchangeApi.fetchPendingTradeRewardPoints(
            [sharedWalletStore.authZOrInjectiveAddress],
            pendingReward.startTimestamp
          )

          return rewards
            .reduce((total, reward) => {
              return total.plus(reward)
            }, ZERO_IN_BASE)
            .toFixed()
        })
      )

      exchangeStore.$patch({
        pendingTradeRewardsPoints: rewards
      })
    },

    async fetchMarketHistory({
      marketIds,
      resolution,
      countback
    }: {
      marketIds: string[]
      resolution: number
      countback: number
    }) {
      const exchangeStore = useExchangeStore()

      const marketHistoryAlreadyExists = marketIds.every((marketId) => {
        return exchangeStore.marketsHistory.find(
          (marketHistory: SharedUiMarketHistory) => {
            return marketHistory.marketId === marketId
          }
        )
      })

      if (marketHistoryAlreadyExists) {
        return
      }

      try {
        const marketsHistory =
          await indexerRestMarketChronosApi.fetchMarketsHistory({
            marketIds,
            resolution,
            countback
          })

        const marketsHistoryToUiMarketsHistory =
          marketsHistory.map(toUiMarketHistory)

        exchangeStore.$patch({
          marketsHistory: [
            ...exchangeStore.marketsHistory,
            ...marketsHistoryToUiMarketsHistory
          ]
        })
      } catch (e) {
        // don't do anything for now
      }
    },

    async fetchMarketsHistory({
      marketIds,
      resolution,
      countback
    }: {
      marketIds: string[]
      resolution: number
      countback: number
    }) {
      const exchangeStore = useExchangeStore()

      if (exchangeStore.marketsHistory.length > 0 || marketIds.length === 0) {
        return
      }

      try {
        const marketsHistory =
          await indexerRestMarketChronosApi.fetchMarketsHistory({
            marketIds,
            resolution,
            countback
          })

        const marketsHistoryToUiMarketsHistory =
          marketsHistory.map(toUiMarketHistory)

        exchangeStore.$patch({
          marketsHistory: [
            ...exchangeStore.marketsHistory,
            ...marketsHistoryToUiMarketsHistory
          ]
        })
      } catch (e) {
        // don't do anything for now
      }
    },

    async fetchMarketHistoryNew({
      marketIds,
      resolution,
      countback
    }: {
      marketIds: string[]
      resolution: number
      countback: number
    }) {
      const exchangeStore = useExchangeStore()

      try {
        const marketsHistory =
          await indexerRestMarketChronosApi.fetchMarketsHistory({
            marketIds,
            resolution,
            countback
          })

        const marketsHistoryToUiMarketsHistory =
          marketsHistory.map(toUiMarketHistory)

        exchangeStore.$patch({
          marketsHistory: [...marketsHistoryToUiMarketsHistory]
        })
      } catch (e) {
        // don't do anything for now
      }
    },

    reset() {
      const exchangeStore = useExchangeStore()

      const {
        tradeRewardsPoints,
        feeDiscountSchedule,
        feeDiscountAccountInfo,
        tradingRewardsCampaign,
        pendingTradeRewardsPoints
      } = initialStateFactory()

      exchangeStore.$patch({
        tradeRewardsPoints,
        feeDiscountSchedule,
        feeDiscountAccountInfo,
        tradingRewardsCampaign,
        pendingTradeRewardsPoints
      })
    }
  }
})
