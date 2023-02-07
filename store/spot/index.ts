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

      await spotStore.fetchMarketsSummary()
      const markets = await indexerSpotApi.fetchMarkets()
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

      spotStore.$patch({
        markets: uiMarketsWithToken
      })
    },

    async fetchUsdcConversionMarkets() {
      const spotStore = useSpotStore()

      const markets = await indexerSpotApi.fetchMarkets()

      const marketsWithToken = await tokenService.getSpotMarketsWithToken(
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
          marketIds: filters?.marketIds || spotStore.activeMarketIds,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as SpotOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: filters?.isConditional,
          pagination: options?.pagination
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
        marketIds: filters?.marketIds || spotStore.activeMarketIds,
        subaccountId: subaccount.subaccountId,
        executionTypes: filters?.executionTypes as TradeExecutionType[],
        direction: filters?.direction,
        pagination: options?.pagination
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
      cancelSubaccountOrdersHistoryStream()
      cancelSubaccountTradesStream()
    },

    resetSubaccount() {
      const spotStore = useSpotStore()

      const initialState = initialStateFactory()

      spotStore.cancelSubaccountStream()

      spotStore.$patch({
        subaccountOrderHistory: initialState.subaccountOrderHistory,
        subaccountOrderHistoryCount: initialState.subaccountOrderHistoryCount,
        subaccountOrders: initialState.subaccountOrders,
        subaccountOrdersCount: initialState.subaccountOrdersCount,
        subaccountTrades: initialState.subaccountTrades,
        subaccountTradesCount: initialState.subaccountOrdersCount
      })
    }
  }
})
