import { defineStore } from 'pinia'
import { TradeExecutionSide, TradeExecutionType } from '@injectivelabs/ts-types'
import { SpotOrderSide } from '@injectivelabs/sdk-ts'
import {
  UiSpotTrade,
  UiSpotOrderbook,
  UiSpotLimitOrder,
  UiSpotTransformer,
  UiSpotOrderHistory,
  UiSpotMarketSummary,
  zeroSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  tokenService,
  indexerSpotApi,
  indexerRestSpotChronosApi
} from '@/app/Services'
import {
  streamTrades,
  streamOrderbook,
  cancelTradesStream,
  cancelOrderbookStream,
  streamSubaccountTrades,
  streamSubaccountOrders,
  cancelSubaccountOrdersStream,
  cancelSubaccountTradesStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrdersHistoryStream
} from '@/store/spot/stream'
import {
  batchCancelOrder,
  cancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/spot/message'
import { UiMarketTransformer } from '@/app/client/transformers/UiMarketTransformer'
import { MARKETS_SLUGS } from '@/app/utils/constants'
import { ActivityFetchOptions, UiMarketAndSummary } from '@/types'

type SpotStoreState = {
  markets: UiSpotMarketWithToken[]
  marketsSummary: UiSpotMarketSummary[]
  orderbook?: UiSpotOrderbook
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
    streamOrderbook,
    cancelTradesStream,
    cancelOrderbookStream,
    streamSubaccountOrders,
    streamSubaccountTrades,
    streamSubaccountOrderHistory,

    cancelOrder,
    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    reset() {
      const spotStore = useSpotStore()

      const initialState = initialStateFactory()

      spotStore.$patch({
        trades: initialState.trades,
        orderbook: initialState.orderbook,
        subaccountTrades: initialState.subaccountTrades,
        subaccountOrders: initialState.subaccountOrders
      })
    },

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

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        marketIds: marketIds || spotStore.activeMarketIds,
        subaccountId: subaccount.subaccountId
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })
    },

    async fetchSubaccountOrderHistory(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          direction: filters?.direction,
          pagination: options?.pagination,
          subaccountId: subaccount.subaccountId,
          isConditional: filters?.isConditional,
          marketIds: filters?.marketIds || spotStore.activeMarketIds,
          orderTypes: filters?.orderTypes as unknown as SpotOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[]
        })

      spotStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
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
        marketIds: [marketId],
        executionSide
      })

      spotStore.$patch({
        trades
      })
    },

    async fetchSubaccountTrades(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        direction: filters?.direction,
        pagination: options?.pagination,
        subaccountId: subaccount.subaccountId,
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
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrdersHistoryStream()
    },

    resetSubaccount() {
      const spotStore = useSpotStore()

      const initialState = initialStateFactory()

      spotStore.cancelSubaccountStream()

      spotStore.$patch({
        subaccountOrders: initialState.subaccountOrders,
        subaccountTrades: initialState.subaccountTrades,
        subaccountTradesCount: initialState.subaccountOrdersCount,
        subaccountOrdersCount: initialState.subaccountOrdersCount,
        subaccountOrderHistory: initialState.subaccountOrderHistory,
        subaccountOrderHistoryCount: initialState.subaccountOrderHistoryCount
      })
    }
  }
})
