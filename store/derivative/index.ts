import { defineStore } from 'pinia'
import {
  OrderSide,
  OrderState,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  PerpetualMarket,
  ExpiryFuturesMarket,
  DerivativeLimitOrder,
  DerivativeOrderHistory
} from '@injectivelabs/sdk-ts'
import {
  pythService,
  indexerOracleApi,
  derivativeCacheApi,
  indexerDerivativesApi
} from '@shared/Service'
import {
  SharedMarketType,
  SharedUiMarketSummary,
  SharedUiDerivativeTrade,
  SharedUiOrderbookWithSequence
} from '@shared/types'
import {
  toUiMarketSummary,
  toUiDerivativeMarket,
  toZeroUiMarketSummary
} from '@shared/transformer/market'
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder,
  submitTpSlOrder
} from '@/store/derivative/message'
import {
  streamTrades,
  cancelTradesStream,
  streamOrderbookUpdate,
  streamSubaccountTrades,
  streamSubaccountOrders,
  streamMarketsMarkPrices,
  cancelMarketsMarkPrices,
  cancelSubaccountTradesStream,
  cancelSubaccountOrdersStream,
  cancelOrderbookUpdateStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream
} from '@/store/derivative/stream'
import { marketIsInactive, combineOrderbookRecords } from '@/app/utils/market'
import {
  MARKETS_SLUGS,
  TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
} from '@/app/utils/constants'
import {
  UiDerivativeMarket,
  UiMarketAndSummary,
  MarketMarkPriceMap,
  ActivityFetchOptions
} from '@/types'

type DerivativeStoreState = {
  recentlyExpiredMarkets: UiDerivativeMarket[]
  markets: UiDerivativeMarket[]
  marketIdsFromQuery: string[]
  marketsSummary: SharedUiMarketSummary[]
  marketMarkPriceMap: MarketMarkPriceMap
  trades: SharedUiDerivativeTrade[]
  orderbook?: SharedUiOrderbookWithSequence
  subaccountTrades: SharedUiDerivativeTrade[]
  subaccountTradesCount: number
  subaccountOrders: DerivativeLimitOrder[]
  subaccountOrdersCount: number
  subaccountOrderHistory: DerivativeOrderHistory[]
  subaccountOrderHistoryCount: number
  subaccountConditionalOrders: DerivativeOrderHistory[]
  subaccountConditionalOrdersCount: number
}

const initialStateFactory = (): DerivativeStoreState => ({
  recentlyExpiredMarkets: [],
  markets: [],
  marketIdsFromQuery: [],
  marketsSummary: [],
  marketMarkPriceMap: {},
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as DerivativeLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as DerivativeOrderHistory[],
  subaccountOrderHistoryCount: 0,
  subaccountConditionalOrders: [] as DerivativeOrderHistory[],
  subaccountConditionalOrdersCount: 0
})

export const useDerivativeStore = defineStore('derivative', {
  state: (): DerivativeStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    perpetualMarkets: (state) =>
      state.markets.filter(
        (market) => market.subType === SharedMarketType.Perpetual
      ),

    expiryFuturesMarkets: (state) =>
      state.markets.filter(
        (market) => market.subType === SharedMarketType.Futures
      ),

    activeMarketIds: (state) =>
      state.markets
        .filter(
          ({ slug, marketId }) =>
            MARKETS_SLUGS.futures.includes(slug) ||
            state.marketIdsFromQuery.includes(marketId)
        )
        .map((m) => m.marketId),

    tradeableDenoms: (state) => [
      ...state.markets.reduce((denoms, market) => {
        if (!market.isVerified) {
          return denoms
        }

        denoms.add(market.quoteDenom)

        return denoms
      }, new Set() as Set<string>)
    ],

    unverifiedDenoms: (state) => [
      ...state.markets.reduce((denoms, market) => {
        if (market.isVerified) {
          return denoms
        }

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
    cancelOrder,
    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,
    submitTpSlOrder,

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

    async init() {
      const derivativeStore = useDerivativeStore()

      await derivativeStore.fetchMarkets()
      await derivativeStore.fetchRecentlyExpiredMarkets()
      await derivativeStore.fetchMarketsSummary()
    },

    async initIfNotInit() {
      const derivativeStore = useDerivativeStore()

      const marketsAlreadyFetched = derivativeStore.markets.length

      if (marketsAlreadyFetched) {
        await derivativeStore.fetchMarketsSummary()
      } else {
        await derivativeStore.init()
      }
    },

    async initFromTradingPage(marketIdFromQuery?: string) {
      const derivativeStore = useDerivativeStore()

      if (!marketIdFromQuery) {
        await derivativeStore.initIfNotInit()

        return
      }

      derivativeStore.$patch({
        marketIdsFromQuery: [
          ...derivativeStore.marketIdsFromQuery,
          marketIdFromQuery
        ]
      })

      await derivativeStore.init()
    },

    async fetchMarkets() {
      const tokenStore = useTokenStore()
      const derivativeStore = useDerivativeStore()

      const markets =
        (await derivativeCacheApi.fetchMarkets()) as PerpetualMarket[]

      const slugs = [...MARKETS_SLUGS.futures, ...MARKETS_SLUGS.expiryFutures]

      const uiMarkets = markets
        .map((market) => {
          const slug = market.ticker
            .replaceAll('/', '-')
            .replaceAll(' ', '-')
            .toLowerCase()

          const [baseTokenSymbol] = slug.split('-')
          const baseToken = tokenStore.tokenBySymbol(baseTokenSymbol)
          const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

          if (!baseToken || !quoteToken) {
            return undefined
          }

          const formattedMarket = toUiDerivativeMarket({
            market,
            baseToken,
            quoteToken,
            slug
          })

          return {
            ...formattedMarket,
            isVerified: slugs.includes(formattedMarket.slug)
          }
        })
        .filter((market) => market) as UiDerivativeMarket[]

      derivativeStore.$patch({
        markets: uiMarkets.sort((derivativeA, derivativeB) => {
          const derivativeAIndex = slugs.indexOf(derivativeA.slug) || 1
          const derivativeBIndex = slugs.indexOf(derivativeB.slug) || 1

          return derivativeAIndex - derivativeBIndex
        })
      })
    },

    async fetchRecentlyExpiredMarkets() {
      const tokenStore = useTokenStore()
      const derivativeStore = useDerivativeStore()

      const recentlyExpiredMarkets = (
        (await derivativeCacheApi.fetchMarkets({
          marketStatus: 'expired'
        })) as Array<ExpiryFuturesMarket>
      ).filter(marketIsInactive)

      const uiMarkets = recentlyExpiredMarkets.map((market) => {
        const slug = market.ticker
          .replaceAll('/', '-')
          .replaceAll(' ', '-')
          .toLowerCase()
        const [baseTokenSymbol] = slug.split('-')
        const baseToken = tokenStore.tokenBySymbol(baseTokenSymbol)
        const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

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

    async fetchOrderbook(marketId: string) {
      const derivativeStore = useDerivativeStore()

      const currentOrderbookSequence = derivativeStore.orderbook?.sequence || 0
      const latestOrderbook = await indexerDerivativesApi.fetchOrderbookV2(
        marketId
      )
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

      // eslint-disable-next-line no-console
      console.log({ trades })

      derivativeStore.$patch({
        trades
      })
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const derivativeStore = useDerivativeStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
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

    async fetchSubaccountOrderHistory(
      options: ActivityFetchOptions | undefined
    ) {
      const derivativeStore = useDerivativeStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          subaccountId: accountStore.subaccountId,
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
      const derivativeStore = useDerivativeStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          subaccountId: accountStore.subaccountId,
          isConditional: true,
          state: OrderState.Booked,
          marketIds: marketIds || derivativeStore.activeMarketIds,
          pagination: {
            limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
          }
        })

      derivativeStore.$patch({
        subaccountConditionalOrders: orderHistory,
        subaccountConditionalOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchMarketsSummary() {
      const derivativeStore = useDerivativeStore()
      const { markets } = derivativeStore

      try {
        const marketSummaries = await derivativeCacheApi.fetchMarketsSummary()

        const marketsWithoutMarketSummaries = marketSummaries.filter(
          ({ marketId }) =>
            !markets.some((market) => market.marketId === marketId)
        )

        derivativeStore.$patch({
          marketsSummary: [
            ...marketSummaries.map(toUiMarketSummary),
            ...marketsWithoutMarketSummaries.map(({ marketId }) =>
              toZeroUiMarketSummary(marketId)
            ),
            ...markets
              .filter(marketIsInactive)
              .map(({ marketId }) => toZeroUiMarketSummary(marketId))
          ]
        })
      } catch (e) {
        // don't do anything for now
      }
    },

    async fetchMarket(marketId: string) {
      const tokenStore = useTokenStore()
      const derivativeStore = useDerivativeStore()

      const updatedMarket = (await indexerDerivativesApi.fetchMarket(
        marketId
      )) as PerpetualMarket

      if (!updatedMarket) {
        return
      }

      const slug = updatedMarket.ticker
        .replaceAll('/', '-')
        .replaceAll(' ', '-')
        .toLowerCase()
      const [baseTokenSymbol] = slug.split('-')
      const baseToken = tokenStore.tokenBySymbol(baseTokenSymbol)
      const quoteToken = tokenStore.tokenByDenomOrSymbol(
        updatedMarket.quoteDenom
      )

      if (!baseToken || !quoteToken || !updatedMarket) {
        return
      }

      const updatedUiMarket = toUiDerivativeMarket({
        slug,
        baseToken,
        quoteToken,
        market: updatedMarket
      })

      const currentMarketIndex = derivativeStore.markets.findIndex(
        (m) => m.marketId === marketId
      )

      if (currentMarketIndex) {
        const markets = [...derivativeStore.markets]
        markets[currentMarketIndex] = {
          ...markets[currentMarketIndex],
          ...updatedUiMarket
        }

        derivativeStore.$patch({
          markets
        })
      }
    },

    async fetchSubaccountTrades(options?: ActivityFetchOptions | undefined) {
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
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

    async fetchRWAMarketIsOpen(pythPriceId: string) {
      return await pythService.fetchRwaMarketOpenNoThrow(pythPriceId)
    },

    cancelStreams() {
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

      derivativeStore.cancelStreams()

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
