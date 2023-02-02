import { defineStore } from 'pinia'
import { TradeExecutionSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { SpotOrderSide } from '@injectivelabs/sdk-ts'
import {
  UiSpotLimitOrder,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSpotOrderHistory,
  UiSpotTrade,
  UiSpotTransformer,
  zeroSpotMarketSummary
} from '@injectivelabs/sdk-ui-ts'
import {
  indexerRestSpotChronosApi,
  indexerSpotApi,
  tokenService
} from '@/app/Services'
import { ActivityFetchOptions } from '@/types'
import {
  cancelOrderbookStream,
  cancelSubaccountOrdersHistoryStream,
  cancelSubaccountOrdersStream,
  cancelSubaccountTradesStream,
  cancelTradesStream,
  streamOrderbook,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountOrderHistory,
  streamSubaccountTrades
} from '@/store/spot/stream'
import {
  batchCancelOrder,
  cancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/spot/message'
import { MARKETS_SLUGS } from '@/app/utils/constants'

type SpotStoreState = {
  markets: UiSpotMarketWithToken[]
  marketsSummary: UiSpotMarketSummary[]
  orderbook?: UiSpotOrderbook
  trades: UiSpotTrade[]
  subaccountTrades: UiSpotTrade[]
  subaccountTradesCount: number
  subaccountOrders: UiSpotLimitOrder[]
  subaccountOrdersCount: number
  subaccountTotalOrdersCount: number
  subaccountOrderHistory: UiSpotOrderHistory[]
  subaccountOrderHistoryCount: number
  subaccountConditionalOrders: UiSpotOrderHistory[]
  subaccountConditionalOrdersCount: number
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
  subaccountTotalOrdersCount: 0,
  subaccountOrderHistory: [] as UiSpotOrderHistory[],
  subaccountOrderHistoryCount: 0,
  subaccountConditionalOrders: [] as UiSpotOrderHistory[],
  subaccountConditionalOrdersCount: 0
})

export const useSpotStore = defineStore('spot', {
  state: (): SpotStoreState => initialStateFactory(),
  getters: {
    activeMarketIds: (state) => state.markets.map((m) => m.marketId),

    supportedTokens: (state) => [
      ...new Map(
        state.markets
          .map(({ baseToken, quoteToken }) => [baseToken, quoteToken])
          .flat()
          .map((item) => [item.denom, item])
      ).values()
    ]
  },
  actions: {
    cancelOrderbookStream,
    cancelTradesStream,
    streamOrderbook,
    streamTrades,
    streamSubaccountOrders,
    streamSubaccountOrderHistory,
    streamSubaccountTrades,

    batchCancelOrder,
    cancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    reset() {
      const spotStore = useSpotStore()

      const initialState = initialStateFactory()

      spotStore.$patch({
        orderbook: initialState.orderbook,
        trades: initialState.trades,
        subaccountOrders: initialState.subaccountOrders,
        subaccountTrades: initialState.subaccountTrades
      })
    },

    async init() {
      const spotStore = useSpotStore()

      const markets = await indexerSpotApi.fetchMarkets()
      const marketsSummary =
        await indexerRestSpotChronosApi.fetchMarketsSummary()
      const marketsWithToken = await tokenService.getSpotMarketsWithToken(
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

      const actualMarketsSummary =
        marketsSummary && marketsSummary.length > 0
          ? marketsSummary
          : [zeroSpotMarketSummary('')]

      spotStore.$patch({
        markets: uiMarketsWithToken,
        marketsSummary: actualMarketsSummary
      })
    },

    async fetchSubaccountOrders(activityFetchOptions?: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime = paginationOptions?.endTime || 0

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        orderSide: filters?.orderSide as SpotOrderSide,
        // isConditional: false,
        pagination: {
          endTime,
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })

      if (activityFetchOptions?.options?.updateTotalCounts) {
        spotStore.$patch({
          subaccountTotalOrdersCount: pagination.total
        })
      }
    },

    async fetchSubaccountOrderHistory(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime = paginationOptions?.endTime || 0

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          marketId: filters?.marketId,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as SpotOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: filters?.isConditional,
          pagination: {
            endTime,
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0
          }
        })

      spotStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchSubaccountConditionalOrders(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime =
        paginationOptions?.endTime ||
        spotStore.subaccountConditionalOrders[0]?.createdAt ||
        0

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          marketId: filters?.marketId,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as SpotOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: true,
          pagination: {
            endTime,
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0
          }
        })

      spotStore.$patch({
        subaccountConditionalOrders: orderHistory,
        subaccountConditionalOrdersCount: pagination.total
      })
    },

    async fetchOrderbook(marketId: string) {
      const spotStore = useSpotStore()

      spotStore.$patch({
        orderbook: await indexerSpotApi.fetchOrderbook(marketId)
      })
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
        marketId,
        executionSide
      })

      spotStore.$patch({
        trades
      })
    },

    async fetchSubaccountTrades(activityFetchOptions?: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime = paginationOptions?.endTime || 0

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        executionTypes: filters?.types as TradeExecutionType[] | undefined,
        direction: filters?.direction,
        pagination: {
          endTime,
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      spotStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    async fetchMarketsSummary() {
      const spotStore = useSpotStore()

      const { marketsSummary, markets } = spotStore

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary =
        await indexerRestSpotChronosApi.fetchMarketsSummary()
      const combinedMarketsSummary =
        UiSpotTransformer.spotMarketsSummaryComparisons(
          updatedMarketsSummary,
          marketsSummary
        )

      if (
        !combinedMarketsSummary ||
        (combinedMarketsSummary && combinedMarketsSummary.length === 0)
      ) {
        spotStore.$patch({
          marketsSummary: markets.map((market) =>
            zeroSpotMarketSummary(market.marketId)
          )
        })
      } else {
        spotStore.$patch({
          marketsSummary: combinedMarketsSummary
        })
      }
    },

    cancelSubaccountStream() {
      cancelSubaccountOrdersStream()
      cancelSubaccountOrdersHistoryStream()
      cancelSubaccountTradesStream()
    },

    resetSubaccount() {
      const spotStore = useSpotStore()

      const initialState = initialStateFactory()

      spotStore.cancelSubaccountStream()

      spotStore.$patch({
        subaccountConditionalOrders: initialState.subaccountConditionalOrders,
        subaccountConditionalOrdersCount:
          initialState.subaccountConditionalOrdersCount,
        subaccountOrderHistory: initialState.subaccountOrderHistory,
        subaccountOrderHistoryCount: initialState.subaccountOrderHistoryCount,
        subaccountOrders: initialState.subaccountOrders,
        subaccountOrdersCount: initialState.subaccountOrdersCount,
        subaccountTotalOrdersCount: initialState.subaccountTotalOrdersCount,
        subaccountTrades: initialState.subaccountTrades,
        subaccountTradesCount: initialState.subaccountOrdersCount
      })
    }
  }
})
