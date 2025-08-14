import { defineStore } from 'pinia'
import { usdtToken } from '@shared/data/token'
import { SharedMarketType } from '@shared/types'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { toUiDerivativeMarket } from '@shared/transformer/market'
import {
  indexerOracleApi,
  cachePythService,
  derivativeCacheApi,
  indexerDerivativesApi
} from '@shared/Service'
import { combineOrderbookRecords } from '@/app/utils/market'
// import { fetchDerivativeStats } from '@/app/services/derivative'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'
import {
  cancelOrder,
  submitChase,
  submitTpSlOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/derivative/message'
import {
  streamTrades,
  cancelTradesStream,
  streamOrderbookUpdate,
  streamSubaccountTrades,
  streamSubaccountOrders,
  streamMarketsMarkPrices,
  cancelMarketsMarkPrices,
  cancelOrderbookUpdateStream,
  cancelSubaccountTradesStream,
  cancelSubaccountOrdersStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream
} from '@/store/derivative/stream'
import type {
  OrderSide,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import type {
  UiDerivativeMarket,
  UiMarketAndSummary,
  MarketMarkPriceMap,
  ActivityFetchOptions
} from '@/types'
import type {
  SharedUiDerivativeTrade,
  SharedUiDerivativeMarket,
  SharedUiOrderbookWithSequence
} from '@shared/types'
import type {
  PositionV2,
  ExpiryFuturesMarket,
  DerivativeLimitOrder,
  DerivativeOrderHistory
} from '@injectivelabs/sdk-ts'

type DerivativeStoreState = {
  marketIdsFromQuery: string[]
  subaccountTradesCount: number
  subaccountOrdersCount: number
  // tickerOpenInterestMap: Record<string, number>
  trades: SharedUiDerivativeTrade[]
  subaccountOrderHistoryCount: number
  marketMarkPriceMap: MarketMarkPriceMap
  subaccountOrders: DerivativeLimitOrder[]
  subaccountConditionalOrdersCount: number
  orderbook?: SharedUiOrderbookWithSequence
  subaccountTrades: SharedUiDerivativeTrade[]
  recentlyExpiredMarkets: UiDerivativeMarket[]
  subaccountOrderHistory: DerivativeOrderHistory[]
  subaccountConditionalOrders: DerivativeLimitOrder[]
}

const initialStateFactory = (): DerivativeStoreState => ({
  recentlyExpiredMarkets: [],
  marketIdsFromQuery: [],
  marketMarkPriceMap: {},
  // tickerOpenInterestMap: {},
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as DerivativeLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as DerivativeOrderHistory[],
  subaccountOrderHistoryCount: 0,
  subaccountConditionalOrders: [] as DerivativeLimitOrder[],
  subaccountConditionalOrdersCount: 0
})

export const useDerivativeStore = defineStore('derivative', {
  state: (): DerivativeStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    marketByIdOrSlug:
      () =>
      (marketIdOrSlug: string): undefined | SharedUiDerivativeMarket => {
        const sharedDerivativeStore = useSharedDerivativeStore()

        const market = sharedDerivativeStore.marketsWithToken.find(
          (market) =>
            market.marketId === marketIdOrSlug || market.slug === marketIdOrSlug
        )

        return market as SharedUiDerivativeMarket
      },

    perpetualMarkets: () => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      sharedDerivativeStore.marketsWithToken.filter(
        (market) => market && market.subType === SharedMarketType.Perpetual
      )
    },

    expiryFuturesMarkets: () => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      return sharedDerivativeStore.marketsWithToken.filter(
        (market) => market.subType === SharedMarketType.Futures
      )
    },

    activeMarketIds: (state) => {
      const jsonStore = useSharedJsonStore()
      const sharedDerivativeStore = useSharedDerivativeStore()

      return sharedDerivativeStore.marketsWithToken
        .filter(
          (market) =>
            [
              ...jsonStore.expiryMarketIds,
              ...jsonStore.verifiedDerivativeMarketIds
            ].includes(market.marketId) ||
            state.marketIdsFromQuery.includes(market.marketId)
        )
        .map((m) => m.marketId)
    },

    tradableDenoms: () => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      return [
        ...sharedDerivativeStore.marketsWithToken.reduce((denoms, market) => {
          if (!market.isVerified) {
            return denoms
          }

          denoms.add(market.quoteDenom)

          return denoms
        }, new Set() as Set<string>)
      ]
    },

    unverifiedDenoms: () => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      return [
        ...sharedDerivativeStore.marketsWithToken.reduce((denoms, market) => {
          if (market.isVerified) {
            return denoms
          }

          denoms.add(market.quoteDenom)

          return denoms
        }, new Set() as Set<string>)
      ]
    },

    marketsWithSummary: () => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      return sharedDerivativeStore.marketsWithToken
        .map((market) => ({
          market,
          summary: sharedDerivativeStore.marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter(({ summary }) => summary) as UiMarketAndSummary[]
    }
  },
  actions: {
    submitChase,
    cancelOrder,
    submitTpSlOrder,
    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    streamTrades,
    cancelTradesStream,
    streamOrderbookUpdate,
    streamSubaccountTrades,
    streamSubaccountOrders,
    streamMarketsMarkPrices,
    cancelMarketsMarkPrices,
    cancelOrderbookUpdateStream,
    cancelSubaccountOrdersStream,
    streamSubaccountOrderHistory,
    cancelSubaccountTradesStream,
    cancelSubaccountOrderHistoryStream,

    async appendMarketId(marketIdFromQuery: string) {
      const derivativeStore = useDerivativeStore()

      derivativeStore.$patch({
        marketIdsFromQuery: [
          ...derivativeStore.marketIdsFromQuery,
          marketIdFromQuery
        ]
      })
    },

    async fetchRecentlyExpiredMarkets() {
      const sharedTokenStore = useSharedTokenStore()
      const derivativeStore = useDerivativeStore()

      const recentlyExpiredMarkets =
        (await derivativeCacheApi.fetchMarkets()) as Array<ExpiryFuturesMarket>

      const uiMarkets = recentlyExpiredMarkets.map((market) => {
        const slug = market.ticker
          .replaceAll('/', '-')
          .replaceAll(' ', '-')
          .toLowerCase()
        const [baseTokenSymbol] = slug.split('-')
        const baseToken = sharedTokenStore.tokenByDenomOrSymbol(baseTokenSymbol)
        const quoteToken = sharedTokenStore.tokenByDenomOrSymbol(
          market.quoteDenom
        )

        if (!baseToken || !quoteToken) {
          return undefined
        }

        return toUiDerivativeMarket({ market, baseToken, quoteToken, slug })
      })

      derivativeStore.$patch({
        recentlyExpiredMarkets: uiMarkets
      })
    },

    async getMarketMarkPrice(market: UiDerivativeMarket) {
      const derivativeStore = useDerivativeStore()

      const oraclePrice = await indexerOracleApi.fetchOraclePrice({
        oracleType: market.oracleType,
        baseSymbol: (market as UiDerivativeMarket).oracleBase,
        quoteSymbol: (market as UiDerivativeMarket).oracleQuote
      })

      derivativeStore.marketMarkPriceMap = {
        ...derivativeStore.marketMarkPriceMap,
        [market.marketId]: {
          marketId: market.marketId,
          price: oraclePrice.price
        }
      }
    },

    // async fetchOpenInterest() {
    //   const derivativeStore = useDerivativeStore()

    //   const stats = await fetchDerivativeStats()

    //   const tickerOpenInterestMap = stats.reduce(
    //     (
    //       list,
    //       {
    //         ticker_id: ticker,
    //         open_interest: openInterest
    //       }: { ticker_id: string; open_interest: number }
    //     ) => {
    //       list[ticker] = openInterest

    //       return list
    //     },
    //     {} as Record<string, number>
    //   )

    //   derivativeStore.$patch({
    //     tickerOpenInterestMap
    //   })
    // },

    async fetchOrderbook(marketId: string) {
      const derivativeStore = useDerivativeStore()

      const currentOrderbookSequence = derivativeStore.orderbook?.sequence || 0
      const latestOrderbook =
        await indexerDerivativesApi.fetchOrderbookV2(marketId)
      const latestOrderbookIsMostRecent =
        latestOrderbook.sequence >= currentOrderbookSequence

      if (latestOrderbookIsMostRecent) {
        derivativeStore.orderbook = latestOrderbook
      }

      // handle race condition between fetch and stream
      derivativeStore.orderbook = {
        sequence: latestOrderbookIsMostRecent
          ? latestOrderbook.sequence
          : currentOrderbookSequence,
        buys: combineOrderbookRecords({
          isBuy: true,
          currentRecords: latestOrderbook.buys,
          updatedRecords: derivativeStore.orderbook?.buys
        }),
        sells: combineOrderbookRecords({
          isBuy: false,
          currentRecords: latestOrderbook.sells,
          updatedRecords: derivativeStore.orderbook?.sells
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
      const derivativeStore = useDerivativeStore()

      const { trades } = await indexerDerivativesApi.fetchTrades({
        marketIds: [marketId],
        executionSide
      })

      derivativeStore.$patch({
        trades
      })
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        subaccountId: accountStore.subaccountId,
        isConditional: false,
        marketIds: marketIds || derivativeStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      derivativeStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchSecondarySubaccountOrders({
      marketIds,
      subaccountId
    }: {
      marketIds: string[]
      subaccountId: string
    }) {
      const derivativeStore = useDerivativeStore()

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        subaccountId,
        isConditional: false,
        marketIds: marketIds || derivativeStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      derivativeStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })
    },

    async fetchSubaccountOrderHistory(
      options: undefined | ActivityFetchOptions
    ) {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          direction: filters?.direction,
          marketIds: filters?.marketIds,
          pagination: options?.pagination,
          isConditional: filters?.isConditional,
          subaccountId: accountStore.subaccountId,
          orderTypes: filters?.orderTypes as unknown as OrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[]
        })

      derivativeStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchOrderHistoryForSubaccount({
      options,
      subaccountId
    }: {
      subaccountId: string
      options?: ActivityFetchOptions
    }) {
      const derivativeStore = useDerivativeStore()

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          subaccountId,
          direction: filters?.direction,
          pagination: options?.pagination,
          isConditional: filters?.isConditional,
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          orderTypes: filters?.orderTypes as unknown as OrderSide[]
        })

      derivativeStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchSubaccountConditionalOrders(marketIds?: string[]) {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        subaccountId: accountStore.subaccountId,
        isConditional: true,
        marketIds: marketIds || derivativeStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      derivativeStore.$patch({
        subaccountConditionalOrders: orders,
        subaccountConditionalOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchSubaccountTrades(options?: undefined | ActivityFetchOptions) {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        direction: filters?.direction,
        subaccountId: accountStore.subaccountId,
        pagination: options?.pagination,
        executionTypes: filters?.executionTypes as TradeExecutionType[],
        marketIds: filters?.marketIds || derivativeStore.activeMarketIds
      })

      derivativeStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    async fetchTradesForSubaccount({
      subaccountId,
      options
    }: {
      subaccountId: string
      options?: ActivityFetchOptions
    }) {
      const derivativeStore = useDerivativeStore()

      const filters = options?.filters

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        subaccountId,
        direction: filters?.direction,
        pagination: options?.pagination,
        executionTypes: filters?.executionTypes as TradeExecutionType[],
        marketIds: filters?.marketIds || derivativeStore.activeMarketIds
      })

      derivativeStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    async fetchRWAMarketIsOpen(pythPriceId: string) {
      return await cachePythService.fetchRwaMarketOpenNoThrow(pythPriceId)
    },

    updateMarkPriceMapFromPosition(positions: PositionV2[]) {
      const derivativeStore = useDerivativeStore()

      const markPricesMap = positions.reduce((markPrices, position) => {
        const market = derivativeStore.marketByIdOrSlug(position.marketId)

        return {
          ...markPrices,
          [position.marketId]: {
            marketId: position.marketId,
            price: sharedToBalanceInToken({
              value: position.markPrice,
              decimalPlaces: market?.quoteToken.decimals || usdtToken.decimals
            })
          }
        }
      }, {} as MarketMarkPriceMap)

      derivativeStore.$patch({
        marketMarkPriceMap: {
          ...derivativeStore.marketMarkPriceMap,
          ...markPricesMap
        }
      })
    },

    cancelSubaccountStream() {
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrderHistoryStream()
    },

    resetOrderbookAndTrades() {
      const derivativeStore = useDerivativeStore()

      derivativeStore.$patch({
        trades: [],
        orderbook: undefined
      })
    },

    resetSubaccount() {
      const derivativeStore = useDerivativeStore()
      const initialState = initialStateFactory()

      derivativeStore.cancelSubaccountStream()

      derivativeStore.$patch({
        subaccountOrders: initialState.subaccountOrders,
        subaccountTrades: initialState.subaccountTrades,
        subaccountTradesCount: initialState.subaccountOrdersCount,
        subaccountOrdersCount: initialState.subaccountOrdersCount,
        subaccountOrderHistory: initialState.subaccountOrderHistory,
        subaccountOrderHistoryCount: initialState.subaccountOrderHistoryCount
      })
    },

    reset() {
      const derivativeStore = useDerivativeStore()

      const { trades, orderbook, subaccountTrades, subaccountOrders } =
        initialStateFactory()

      derivativeStore.$patch({
        trades,
        orderbook,
        subaccountTrades,
        subaccountOrders
      })
    }
  }
})
