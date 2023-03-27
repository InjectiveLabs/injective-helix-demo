import { defineStore } from 'pinia'
import {
  ZERO_IN_BASE,
  UiMarketHistory,
  zeroSpotMarketSummary,
  UiMarketsHistoryTransformer
} from '@injectivelabs/sdk-ui-ts'
import {
  ExchangeParams,
  FeeDiscountSchedule,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import type { Token } from '@injectivelabs/token-metadata'
import {
  denomClient,
  exchangeApi,
  indexerRestMarketChronosApi
} from '@/app/Services'
import { upcomingMarkets, deprecatedMarkets } from '@/app/data/market'
import { TradingRewardsCampaign } from '@/app/client/types/exchange'
import { UiMarketWithToken, UiMarketSummary, UiMarketAndSummary } from '@/types'

type ExchangeStoreState = {
  params?: ExchangeParams
  feeDiscountSchedule?: FeeDiscountSchedule
  feeDiscountAccountInfo?: FeeDiscountAccountInfo
  tradingRewardsCampaign?: TradingRewardsCampaign
  tradeRewardsPoints: string[]
  pendingTradeRewardsPoints: string[]
  upcomingMarkets: UiMarketWithToken[]
  upcomingMarketsSummaries: UiMarketSummary[]
  deprecatedMarkets: UiMarketWithToken[]
  deprecatedMarketsSummaries: UiMarketSummary[]
  marketsHistory: UiMarketHistory[]
}

const initialStateFactory = (): ExchangeStoreState => ({
  params: undefined,
  feeDiscountSchedule: undefined,
  feeDiscountAccountInfo: undefined,
  tradingRewardsCampaign: undefined,
  tradeRewardsPoints: [],
  pendingTradeRewardsPoints: [],

  upcomingMarkets,
  upcomingMarketsSummaries: upcomingMarkets.map((m) =>
    zeroSpotMarketSummary(m.marketId)
  ),

  deprecatedMarkets,
  deprecatedMarketsSummaries: deprecatedMarkets.map((m) =>
    zeroSpotMarketSummary(m.marketId)
  ),
  marketsHistory: []
})

export const useExchangeStore = defineStore('exchange', {
  state: (): ExchangeStoreState => initialStateFactory(),

  getters: {
    deprecatedMarketsWithSummary: (state) =>
      state.deprecatedMarkets
        .map((market) => ({
          market,
          summary: state.deprecatedMarketsSummaries.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter((summary) => summary) as UiMarketAndSummary[],

    upcomingMarketsWithSummary: (state) =>
      state.upcomingMarkets
        .map((market) => ({
          market,
          summary: state.upcomingMarketsSummaries.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter((summary) => summary) as UiMarketAndSummary[]
  },

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
            async (denom) => await denomClient.getDenomToken(denom)
          )
        )) as Token[]

        const feeDiscountScheduleWithToken = {
          ...feeDiscountSchedule,
          quoteTokenMeta
        } as FeeDiscountSchedule

        exchangeStore.$patch({
          feeDiscountSchedule: feeDiscountScheduleWithToken
        })
      }
    },

    async fetchFeeDiscountAccountInfo() {
      const exchangeStore = useExchangeStore()
      const { isUserWalletConnected, injectiveAddress } = useWalletStore()

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      const feeDiscountAccountInfo =
        await exchangeApi.fetchFeeDiscountAccountInfo(injectiveAddress)

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

      if (tradingRewardsCampaign) {
        const quoteDenomsList = tradingRewardsCampaign.tradingRewardCampaignInfo
          ? tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList
          : []
        const quoteSymbolsList = (
          (
            await Promise.all(
              quoteDenomsList.map(
                async (denom) => await denomClient.getDenomToken(denom)
              )
            )
          ).filter((token) => token) as Token[]
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
      }
    },

    async fetchTradeRewardPoints() {
      const exchangeStore = useExchangeStore()

      const { isUserWalletConnected, injectiveAddress } = useWalletStore()

      if (!isUserWalletConnected || !injectiveAddress) {
        return
      }

      exchangeStore.$patch({
        tradeRewardsPoints: await exchangeApi.fetchTradeRewardPoints([
          injectiveAddress
        ])
      })
    },

    async fetchPendingTradeRewardPoints() {
      const exchangeStore = useExchangeStore()
      const { isUserWalletConnected, injectiveAddress } = useWalletStore()

      if (!isUserWalletConnected || !injectiveAddress) {
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
            [injectiveAddress],
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

    async getMarketsHistory({
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
          (marketHistory: UiMarketHistory) => {
            return marketHistory.marketId === marketId
          }
        )
      })

      if (marketHistoryAlreadyExists) {
        return
      }

      const marketsHistory =
        await indexerRestMarketChronosApi.fetchMarketsHistory({
          marketIds,
          resolution,
          countback
        })

      const marketsHistoryToUiMarketsHistory =
        UiMarketsHistoryTransformer.marketsHistoryToUiMarketsHistory(
          marketsHistory
        )

      exchangeStore.$patch({
        marketsHistory: [
          ...exchangeStore.marketsHistory,
          ...marketsHistoryToUiMarketsHistory
        ]
      })
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
