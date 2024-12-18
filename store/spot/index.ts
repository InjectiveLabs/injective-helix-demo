import { defineStore } from 'pinia'
import {
  SpotMarket,
  SpotLimitOrder,
  SpotOrderHistory
} from '@injectivelabs/sdk-ts'
import {
  SharedUiSpotTrade,
  SharedUiMarketSummary,
  SharedUiOrderbookWithSequence
} from '@shared/types'
import {
  OrderSide,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  toUiSpotMarket,
  toUiMarketSummary,
  toZeroUiMarketSummary
} from '@shared/transformer/market'
import { spotCacheApi, indexerSpotApi } from '@shared/Service'
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder,
  submitChase
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
import { verifiedSpotSlugs, verifiedSpotMarketIds } from '@/app/json'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'
import { combineOrderbookRecords } from '@/app/utils/market'
import { UiSpotMarket, UiMarketAndSummary, ActivityFetchOptions } from '@/types'
import { marketIdsToHide } from '@/app/data/market'

type SpotStoreState = {
  markets: UiSpotMarket[]
  marketIdsFromQuery: string[]
  marketsSummary: SharedUiMarketSummary[]
  orderbook?: SharedUiOrderbookWithSequence
  trades: SharedUiSpotTrade[]
  subaccountTrades: SharedUiSpotTrade[]
  subaccountTradesCount: number
  subaccountOrders: SpotLimitOrder[]
  subaccountOrdersCount: number
  subaccountOrderHistory: SpotOrderHistory[]
  subaccountOrderHistoryCount: number
}

const initialStateFactory = (): SpotStoreState => ({
  markets: [],
  marketIdsFromQuery: [],
  marketsSummary: [],
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

    activeMarketIds: (state) =>
      state.markets
        .filter(
          ({ marketId }) =>
            verifiedSpotMarketIds.includes(marketId) ||
            state.marketIdsFromQuery.includes(marketId)
        )
        .map((m) => m.marketId),

    tradeableDenoms: (state) => [
      ...state.markets.reduce((denoms, market) => {
        if (!market.isVerified) {
          return denoms
        }

        denoms.add(market.baseDenom)
        denoms.add(market.quoteDenom)

        return denoms
      }, new Set() as Set<string>)
    ],

    unverifiedDenoms: (state) => [
      ...state.markets.reduce((denoms, market) => {
        if (market.isVerified) {
          return denoms
        }

        denoms.add(market.baseDenom)
        denoms.add(market.quoteDenom)

        return denoms
      }, new Set() as Set<string>)
    ],

    marketsWithSummary: (state) =>
      state.markets
        .map((market) => ({
          market,
          summary: state.marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter((summary) => summary) as UiMarketAndSummary[]
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
    submitStopLimitOrder,
    submitStopMarketOrder,

    async appendMarketId(marketIdFromQuery: string) {
      const spotStore = useSpotStore()

      spotStore.$patch({
        marketIdsFromQuery: [...spotStore.marketIdsFromQuery, marketIdFromQuery]
      })

      await spotStore.fetchMarkets()
    },

    async fetchMarkets() {
      const spotStore = useSpotStore()
      const tokenStore = useTokenStore()

      const markets = await spotCacheApi.fetchMarkets()

      const marketsFromQuery = spotStore.marketIdsFromQuery
        .map((marketId) => markets.find((m) => m.marketId === marketId))
        .filter((market) => market) as SpotMarket[]

      if (marketsFromQuery.length !== 0) {
        await tokenStore.appendUnknownTokensList([
          ...marketsFromQuery.map((m) => m.baseDenom),
          ...marketsFromQuery.map((m) => m.quoteDenom)
        ])
      }

      const uiMarkets = markets
        .map((market) => {
          const baseToken = tokenStore.tokenByDenomOrSymbol(market.baseDenom)
          const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

          if (!baseToken || !quoteToken) {
            return undefined
          }

          const formattedMarket = toUiSpotMarket({
            market,
            baseToken,
            quoteToken
          })

          return {
            ...formattedMarket,
            isVerified: verifiedSpotMarketIds.includes(market.marketId)
          }
        })
        .filter(
          (market) => market && !marketIdsToHide.includes(market.marketId)
        ) as UiSpotMarket[]

      spotStore.$patch({
        markets: uiMarkets.sort((spotA, spotB) => {
          const spotAIndex = verifiedSpotSlugs.indexOf(spotA.slug) || 1
          const spotBIndex = verifiedSpotSlugs.indexOf(spotB.slug) || 1

          return spotAIndex - spotBIndex
        })
      })
    },

    async fetchMarketsSummary() {
      const spotStore = useSpotStore()

      const marketsSummaries = (await spotCacheApi.fetchMarketsSummary()) || []

      const uiMarketSummaries = marketsSummaries.map((marketSummary) => {
        const marketExistInStore = spotStore.markets.some(
          (market) => market.marketId === marketSummary.marketId
        )

        return marketExistInStore
          ? toUiMarketSummary(marketSummary)
          : toZeroUiMarketSummary(marketSummary.marketId)
      })

      spotStore.$patch({
        marketsSummary: uiMarketSummaries
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
        subaccountId: accountStore.subaccountId,
        marketIds: marketIds || spotStore.activeMarketIds,
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
      subaccountId: string
      marketIds: string[]
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
        subaccountOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchSubaccountOrderHistory(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId: accountStore.subaccountId,
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

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        subaccountId: accountStore.subaccountId,
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
