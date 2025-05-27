import { defineStore } from 'pinia'
import { indexerSpotApi } from '@shared/Service'
import { combineOrderbookRecords } from '@/app/utils/market'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'
import {
  cancelOrder,
  submitChase,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder
} from '@/store/spot/message'
import {
  streamTrades,
  cancelTradesStream,
  streamOrderbookUpdate,
  streamSubaccountTrades,
  streamSubaccountOrders,
  cancelOrderbookUpdateStream,
  cancelSubaccountOrdersStream,
  cancelSubaccountTradesStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrdersHistoryStream
} from '@/store/spot/stream'
import type { UiMarketAndSummary, ActivityFetchOptions } from '@/types'
import type { SpotLimitOrder, SpotOrderHistory } from '@injectivelabs/sdk-ts'
import type {
  OrderSide,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import type {
  SharedUiSpotTrade,
  SharedUiSpotMarket,
  SharedUiOrderbookWithSequence
} from '@shared/types'

type SpotStoreState = {
  trades: SharedUiSpotTrade[]
  marketIdsFromQuery: string[]
  subaccountTradesCount: number
  subaccountOrdersCount: number
  subaccountOrders: SpotLimitOrder[]
  subaccountOrderHistoryCount: number
  subaccountTrades: SharedUiSpotTrade[]
  orderbook?: SharedUiOrderbookWithSequence
  subaccountOrderHistory: SpotOrderHistory[]
}

const initialStateFactory = (): SpotStoreState => ({
  marketIdsFromQuery: [],
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as SpotLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as SpotOrderHistory[],
  subaccountOrderHistoryCount: 0
})

export const useSpotStore = defineStore('spot', {
  state: (): SpotStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    marketByIdOrSlug:
      () =>
      (marketIdOrSlug: string): undefined | SharedUiSpotMarket => {
        const sharedSpotStore = useSharedSpotStore()

        const market = sharedSpotStore.marketsWithToken.find(
          (market) =>
            market.marketId === marketIdOrSlug || market.slug === marketIdOrSlug
        )

        return market as SharedUiSpotMarket
      },

    activeMarketIds: (state) => {
      const jsonStore = useSharedJsonStore()
      const sharedSpotStore = useSharedSpotStore()

      return sharedSpotStore.marketsWithToken
        .filter(
          ({ marketId }) =>
            state.marketIdsFromQuery.includes(marketId) ||
            jsonStore.verifiedSpotMarketIds.includes(marketId)
        )
        .map((m) => m.marketId)
    },

    tradableDenoms: () => {
      const sharedSpotStore = useSharedSpotStore()

      return [
        ...sharedSpotStore.marketsWithToken.reduce((denoms, market) => {
          if (!market.isVerified) {
            return denoms
          }

          denoms.add(market.baseDenom)
          denoms.add(market.quoteDenom)

          return denoms
        }, new Set() as Set<string>)
      ]
    },

    unverifiedDenoms: () => {
      const sharedSpotStore = useSharedSpotStore()

      return [
        ...sharedSpotStore.marketsWithToken.reduce((denoms, market) => {
          if (market.isVerified) {
            return denoms
          }

          denoms.add(market.baseDenom)
          denoms.add(market.quoteDenom)

          return denoms
        }, new Set() as Set<string>)
      ]
    },

    marketsWithSummary: () => {
      const sharedSpotStore = useSharedSpotStore()

      return sharedSpotStore.marketsWithToken
        .map((market) => ({
          market,
          summary: sharedSpotStore.marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter(({ summary }) => summary) as UiMarketAndSummary[]
    }
  },
  actions: {
    submitChase,
    streamTrades,
    cancelTradesStream,
    streamOrderbookUpdate,
    streamSubaccountOrders,
    streamSubaccountTrades,
    cancelOrderbookUpdateStream,
    streamSubaccountOrderHistory,

    cancelOrder,
    cancelSubaccountOrdersStream,
    cancelSubaccountTradesStream,
    cancelSubaccountOrdersHistoryStream,

    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,

    async appendMarketId(marketIdFromQuery: string) {
      const spotStore = useSpotStore()

      spotStore.$patch({
        marketIdsFromQuery: [...spotStore.marketIdsFromQuery, marketIdFromQuery]
      })
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        marketIds,
        subaccountId: accountStore.subaccountId,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchOrdersBySubaccount({
      subaccountId,
      marketIds
    }: {
      marketIds: string[]
      subaccountId: string
    }) {
      const spotStore = useSpotStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !subaccountId) {
        return
      }

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        subaccountId,
        marketIds: marketIds || spotStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })
    },

    async fetchSubaccountOrderHistory(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!(sharedWalletStore.isUserConnected && accountStore.subaccountId)) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId: options?.subaccountId || accountStore.subaccountId,
          direction: filters?.direction,
          pagination: options?.pagination,
          isConditional: filters?.isConditional,
          marketIds: filters?.marketIds || spotStore.activeMarketIds,
          orderTypes: filters?.orderTypes as unknown as OrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[]
        })

      spotStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchOrderHistoryForSubaccount(options: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      if (!options?.subaccountId) {
        return
      }

      const filters = options.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId: options.subaccountId,
          direction: filters?.direction,
          pagination: options.pagination,
          isConditional: filters?.isConditional,
          marketIds: filters?.marketIds || spotStore.activeMarketIds,
          orderTypes: filters?.orderTypes as unknown as OrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[]
        })

      spotStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchOrderbook(marketId: string) {
      const spotStore = useSpotStore()

      const currentOrderbookSequence = spotStore.orderbook?.sequence || 0
      const latestOrderbook = await indexerSpotApi.fetchOrderbookV2(marketId)
      const latestOrderbookIsMostRecent =
        latestOrderbook.sequence >= currentOrderbookSequence

      if (latestOrderbookIsMostRecent) {
        spotStore.orderbook = latestOrderbook
      }

      // handle race condition between fetch and stream
      spotStore.orderbook = {
        sequence: latestOrderbookIsMostRecent
          ? latestOrderbook.sequence
          : currentOrderbookSequence,
        buys: combineOrderbookRecords({
          isBuy: true,
          currentRecords: spotStore.orderbook?.buys,
          updatedRecords: latestOrderbook.buys
        }),
        sells: combineOrderbookRecords({
          isBuy: false,
          currentRecords: spotStore.orderbook?.sells,
          updatedRecords: latestOrderbook.sells
        })
      }
    },

    async fetchTrades({
      marketId,
      executionSide
    }: {
      marketId: string
      executionSide?: TradeExecutionSide
    }) {
      const spotStore = useSpotStore()

      const { trades } = await indexerSpotApi.fetchTrades({
        marketIds: [marketId],
        executionSide
      })

      spotStore.$patch({
        trades
      })
    },

    async fetchLastTrade({
      marketId,
      executionSide
    }: {
      marketId: string
      executionSide?: TradeExecutionSide
    }) {
      const { trades } = await indexerSpotApi.fetchTrades({
        marketIds: [marketId],
        executionSide,
        pagination: { limit: 1 }
      })

      return trades[0]
    },

    async fetchSubaccountTrades(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!(sharedWalletStore.isUserConnected && accountStore.subaccountId)) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        subaccountId: options?.subaccountId || accountStore.subaccountId,
        direction: filters?.direction,
        pagination: options?.pagination,
        marketIds: filters?.marketIds || spotStore.activeMarketIds,
        executionTypes: filters?.executionTypes as TradeExecutionType[]
      })

      spotStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    async fetchTradesForSubaccount(options: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      if (!options?.subaccountId) {
        return
      }

      const filters = options.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        subaccountId: options.subaccountId,
        direction: filters?.direction,
        pagination: options.pagination,
        marketIds: filters?.marketIds || spotStore.activeMarketIds,
        executionTypes: filters?.executionTypes as TradeExecutionType[]
      })

      spotStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    cancelSubaccountStream() {
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrdersHistoryStream()
    },

    resetOrderbookAndTrades() {
      const spotStore = useSpotStore()

      spotStore.$patch({
        trades: [],
        orderbook: undefined
      })
    },

    resetSubaccount() {
      const spotStore = useSpotStore()

      const {
        subaccountOrders,
        subaccountTrades,
        subaccountOrdersCount,
        subaccountTradesCount,
        subaccountOrderHistory,
        subaccountOrderHistoryCount
      } = initialStateFactory()

      spotStore.cancelSubaccountStream()

      spotStore.$patch({
        subaccountOrders,
        subaccountTrades,
        subaccountTradesCount,
        subaccountOrdersCount,
        subaccountOrderHistory,
        subaccountOrderHistoryCount
      })
    },

    reset() {
      const spotStore = useSpotStore()

      const { trades, orderbook, subaccountOrders, subaccountTrades } =
        initialStateFactory()

      spotStore.$patch({
        trades,
        orderbook,
        subaccountOrders,
        subaccountTrades
      })
    }
  }
})
