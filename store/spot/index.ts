import { defineStore } from 'pinia'
import {
  OrderSide,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  UiSpotTrade,
  UiSpotLimitOrder,
  UiSpotTransformer,
  UiSpotOrderHistory,
  UiSpotMarketSummary,
  zeroSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '../account/stream'
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
  tokenService,
  indexerSpotApi,
  indexerRestSpotChronosApi
} from '@/app/Services'
import {
  MARKETS_SLUGS,
  TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
} from '@/app/utils/constants'
import { combineOrderbookRecords } from '@/app/utils/market'
import { UiMarketTransformer } from '@/app/client/transformers/UiMarketTransformer'
import {
  UiMarketAndSummary,
  ActivityFetchOptions,
  UiSpotOrderbookWithSequence
} from '@/types'

type SpotStoreState = {
  markets: UiSpotMarketWithToken[]
  marketsSummary: UiSpotMarketSummary[]
  orderbook?: UiSpotOrderbookWithSequence
  trades: UiSpotTrade[]
  subaccountTrades: UiSpotTrade[]
  subaccountTradesCount: number
  subaccountOrders: UiSpotLimitOrder[]
  subaccountOrdersCount: number
  subaccountOrderHistory: UiSpotOrderHistory[]
  subaccountOrderHistoryCount: number

  usdcConversionModalMarkets: UiSpotMarketWithToken[]
}

const initialStateFactory = (): SpotStoreState => ({
  markets: [],
  marketsSummary: [],
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as UiSpotLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as UiSpotOrderHistory[],
  subaccountOrderHistoryCount: 0,

  usdcConversionModalMarkets: []
})

export const useSpotStore = defineStore('spot', {
  state: (): SpotStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    activeMarketIds: (state) =>
      state.markets
        .filter(({ slug }) => MARKETS_SLUGS.spot.includes(slug))
        .map((m) => m.marketId),

    tradeableDenoms: (state) =>
      [...state.usdcConversionModalMarkets, ...state.markets].reduce(
        (denoms, market) => {
          if (!denoms.includes(market.baseDenom)) {
            denoms.push(market.baseDenom)
          }

          if (!denoms.includes(market.quoteDenom)) {
            denoms.push(market.quoteDenom)
          }

          return denoms
        },
        [] as string[]
      ),

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
    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    async init() {
      const spotStore = useSpotStore()

      const marketsAlreadyFetched = spotStore.markets.length

      if (marketsAlreadyFetched) {
        await spotStore.fetchMarketsSummary()

        return
      }

      const markets = await indexerSpotApi.fetchMarkets()
      const marketsWithToken = await tokenService.toSpotMarketsWithToken(
        markets
      )

      const uiMarkets =
        UiSpotTransformer.spotMarketsToUiSpotMarkets(marketsWithToken)

      const uiMarketsWithToken = uiMarkets
        .filter((market) => {
          return MARKETS_SLUGS.spot.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.spot.indexOf(a.slug) -
            MARKETS_SLUGS.spot.indexOf(b.slug)
          )
        })

      spotStore.$patch({
        markets: uiMarketsWithToken
      })

      await spotStore.fetchMarketsSummary()
    },

    async fetchUsdcConversionMarkets() {
      const spotStore = useSpotStore()

      const markets = await indexerSpotApi.fetchMarkets()

      const marketsWithToken = await tokenService.toSpotMarketsWithToken(
        markets
      )
      const uiMarkets =
        UiSpotTransformer.spotMarketsToUiSpotMarkets(marketsWithToken)

      const usdcConversionModalMarketsWithToken = uiMarkets
        .filter((market) => {
          return MARKETS_SLUGS.usdcConversionModalMarkets.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.usdcConversionModalMarkets.indexOf(a.slug) -
            MARKETS_SLUGS.usdcConversionModalMarkets.indexOf(b.slug)
          )
        })

      spotStore.$patch({
        usdcConversionModalMarkets: usdcConversionModalMarketsWithToken
      })
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const spotStore = useSpotStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
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

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId,
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

    async fetchSubaccountTrades(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        subaccountId,
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

    async fetchMarketsSummary() {
      const spotStore = useSpotStore()

      const { markets } = spotStore

      const marketSummaries =
        await indexerRestSpotChronosApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = marketSummaries.filter(
        ({ marketId }) =>
          !markets.some((market) => market.marketId === marketId)
      )

      spotStore.$patch({
        marketsSummary: [
          ...marketSummaries.map(
            UiMarketTransformer.convertMarketSummaryToUiMarketSummary
          ),
          ...marketsWithoutMarketSummaries.map(({ marketId }) =>
            zeroSpotMarketSummary(marketId)
          )
        ]
      })
    },

    cancelSubaccountStream() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrdersHistoryStream()
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
