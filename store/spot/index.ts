import { defineStore } from 'pinia'
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
import {
  SharedUiSpotTrade,
  SharedUiMarketSummary,
  SharedUiOrderbookWithSequence
} from '@shared/types'
import { spotCacheApi, indexerSpotApi } from '@shared/Service'
import {
  SpotLimitOrder,
  SpotMarket,
  SpotOrderHistory
} from '@injectivelabs/sdk-ts'
import {
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/account/stream'
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
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/spot/message'
import {
  MARKETS_SLUGS,
  TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
} from '@/app/utils/constants'
import { combineOrderbookRecords } from '@/app/utils/market'
import { UiSpotMarket, UiMarketAndSummary, ActivityFetchOptions } from '@/types'

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
          ({ slug, marketId }) =>
            MARKETS_SLUGS.spot.includes(slug) ||
            state.marketIdsFromQuery.includes(marketId)
        )
        .map((m) => m.marketId),

    tradeableDenoms: (state) =>
      [...state.markets].reduce((denoms, market) => {
        if (!denoms.includes(market.baseDenom)) {
          denoms.push(market.baseDenom)
        }

        if (!denoms.includes(market.quoteDenom)) {
          denoms.push(market.quoteDenom)
        }

        return denoms
      }, [] as string[]),

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

    async init() {
      const spotStore = useSpotStore()

      await spotStore.fetchMarkets()
      await spotStore.fetchMarketsSummary()
    },

    async initIfNotInit() {
      const spotStore = useSpotStore()

      const marketsAlreadyFetched = spotStore.markets.length

      if (marketsAlreadyFetched) {
        await spotStore.fetchMarketsSummary()
      } else {
        await spotStore.init()
      }
    },

    async initFromTradingPage(marketIdFromQuery?: string) {
      const spotStore = useSpotStore()

      if (!marketIdFromQuery) {
        await spotStore.initIfNotInit()

        return
      }

      spotStore.$patch({
        marketIdsFromQuery: [...spotStore.marketIdsFromQuery, marketIdFromQuery]
      })

      await spotStore.init()
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
            // console.log({
            //   market: market.marketId,
            //   baseDenom: market.baseDenom,
            //   baseToken: market.baseToken,
            //   quoteToken: market.quoteToken
            // })

            return undefined
          }

          const formattedMarket = toUiSpotMarket({
            market,
            baseToken,
            quoteToken
          })

          return {
            ...formattedMarket,
            isVerified: MARKETS_SLUGS.spot.includes(formattedMarket.slug)
          }
        })
        .filter((market) => market) as UiSpotMarket[]

      spotStore.$patch({
        markets: uiMarkets.sort((spotA, spotB) => {
          const spotAIndex = MARKETS_SLUGS.spot.indexOf(spotA.slug) || 1
          const spotBIndex = MARKETS_SLUGS.spot.indexOf(spotB.slug) || 1

          return spotAIndex - spotBIndex
        })
      })
    },

    async fetchMarketsSummary() {
      const spotStore = useSpotStore()

      if (spotStore.marketsSummary.length > 0) {
        return
      }

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
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
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
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !subaccountId) {
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
      const walletStore = useWalletStore()

      if (
        !walletStore.isUserWalletConnected ||
        !(accountStore.subaccountId || options?.subaccountId)
      ) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId: options?.subaccountId
            ? options?.subaccountId
            : accountStore.subaccountId,
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
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
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
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
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
