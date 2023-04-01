import { defineStore } from 'pinia'
import {
  OrderSide,
  OrderState,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  MarketType,
  UiDerivativeTrade,
  UiDerivativeLimitOrder,
  UiDerivativeTransformer,
  UiDerivativeOrderHistory,
  UiDerivativeMarketSummary,
  UiPerpetualMarketWithToken,
  zeroDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiBinaryOptionsMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  PerpetualMarket,
  BinaryOptionsMarket,
  ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import {
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '../account/stream'
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/derivative/message'
import {
  streamTrades,
  streamOrderbookUpdate,
  streamSubaccountTrades,
  streamSubaccountOrders,
  streamMarketsMarkPrices,
  cancelMarketsMarkPrices,
  cancelSubaccountTradesStream,
  cancelSubaccountOrdersStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream
} from '@/store/derivative/stream'
import {
  combineOrderbookRecords,
  marketHasRecentlyExpired
} from '@/app/utils/market'
import {
  tokenService,
  indexerOracleApi,
  indexerDerivativesApi,
  indexerRestDerivativesChronosApi
} from '@/app/Services'
import {
  IS_DEVNET,
  MARKETS_SLUGS,
  TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
} from '@/app/utils/constants'
import { UiMarketTransformer } from '@/app/client/transformers/UiMarketTransformer'
import {
  UiMarketAndSummary,
  MarketMarkPriceMap,
  ActivityFetchOptions,
  UiDerivativeOrderbookWithSequence
} from '@/types'

type DerivativeStoreState = {
  perpetualMarkets: UiPerpetualMarketWithToken[]
  expiryFuturesMarkets: UiExpiryFuturesMarketWithToken[]
  recentlyExpiredMarkets: UiExpiryFuturesMarketWithToken[]
  binaryOptionsMarkets: UiBinaryOptionsMarketWithToken[]
  markets: UiDerivativeMarketWithToken[]
  marketsSummary: UiDerivativeMarketSummary[]
  marketMarkPriceMap: MarketMarkPriceMap
  trades: UiDerivativeTrade[]
  orderbook?: UiDerivativeOrderbookWithSequence
  subaccountTrades: UiDerivativeTrade[]
  subaccountTradesCount: number
  subaccountOrders: UiDerivativeLimitOrder[]
  subaccountOrdersCount: number
  subaccountOrderHistory: UiDerivativeOrderHistory[]
  subaccountOrderHistoryCount: number
  subaccountConditionalOrders: UiDerivativeOrderHistory[]
  subaccountConditionalOrdersCount: number
}

const initialStateFactory = (): DerivativeStoreState => ({
  perpetualMarkets: [],
  expiryFuturesMarkets: [],
  recentlyExpiredMarkets: [],
  binaryOptionsMarkets: [],
  markets: [],
  marketsSummary: [],
  marketMarkPriceMap: {},
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as UiDerivativeLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as UiDerivativeOrderHistory[],
  subaccountOrderHistoryCount: 0,
  subaccountConditionalOrders: [] as UiDerivativeOrderHistory[],
  subaccountConditionalOrdersCount: 0
})

export const useDerivativeStore = defineStore('derivative', {
  state: (): DerivativeStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    activeMarketIds: (state) =>
      state.markets
        .filter(({ slug }) => MARKETS_SLUGS.futures.includes(slug))
        .map((m) => m.marketId),

    tradeableDenoms: (state) =>
      state.markets.reduce((denoms, market) => {
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
    cancelOrder,
    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    streamTrades,
    streamOrderbookUpdate,
    streamSubaccountTrades,
    streamSubaccountOrders,
    streamMarketsMarkPrices,
    cancelMarketsMarkPrices,
    cancelSubaccountOrdersStream,
    streamSubaccountOrderHistory,
    cancelSubaccountTradesStream,
    cancelSubaccountOrderHistoryStream,

    async init() {
      const derivativeStore = useDerivativeStore()

      const marketsAlreadyFetched = derivativeStore.markets.length

      if (marketsAlreadyFetched) {
        await derivativeStore.fetchMarketsSummary()

        return
      }

      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >
      const recentlyExpiredMarkets = (
        (await indexerDerivativesApi.fetchMarkets({
          marketStatus: 'expired'
        })) as Array<ExpiryFuturesMarket>
      ).filter(marketHasRecentlyExpired)

      const marketsWithToken = await tokenService.toDerivativeMarketsWithToken(
        markets
      )
      const recentlyExpiredMarketsWithToken =
        await tokenService.toDerivativeMarketsWithToken(recentlyExpiredMarkets)

      const perpetualMarkets = marketsWithToken.filter((m) => m.isPerpetual)
      const expiryFuturesMarkets = marketsWithToken.filter(
        (m) => !m.isPerpetual
      )

      const uiPerpetualMarkets =
        UiDerivativeTransformer.perpetualMarketsToUiPerpetualMarkets(
          perpetualMarkets
        )
      const uiExpiryFuturesMarkets =
        UiDerivativeTransformer.expiryFuturesMarketsToUiExpiryFuturesMarkets(
          expiryFuturesMarkets
        )
      const uiRecentlyExpiredMarkets =
        UiDerivativeTransformer.expiryFuturesMarketsToUiExpiryFuturesMarkets(
          recentlyExpiredMarketsWithToken
        )
      const binaryOptionsMarkets = IS_DEVNET
        ? ((await indexerDerivativesApi.fetchBinaryOptionsMarkets()) as BinaryOptionsMarket[])
        : []
      const binaryOptionsMarketsWithToken =
        await tokenService.toBinaryOptionsMarketsWithToken(binaryOptionsMarkets)
      const uiBinaryOptionsMarkets =
        UiDerivativeTransformer.binaryOptionsMarketsToUiBinaryOptionsMarkets(
          binaryOptionsMarketsWithToken
        )

      // Only include markets that we pre-defined to generate static routes for
      const uiPerpetualMarketsWithToken = uiPerpetualMarkets
        .filter((market) => {
          return MARKETS_SLUGS.futures.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.futures.indexOf(a.slug) -
            MARKETS_SLUGS.futures.indexOf(b.slug)
          )
        })
      const uiExpiryFuturesWithToken = uiExpiryFuturesMarkets
        .filter((market) => {
          return MARKETS_SLUGS.expiryFutures.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.expiryFutures.indexOf(a.slug) -
            MARKETS_SLUGS.expiryFutures.indexOf(b.slug)
          )
        })
      const uiBinaryOptionsMarketsWithToken = uiBinaryOptionsMarkets
        .filter((market) => {
          return MARKETS_SLUGS.binaryOptions.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.binaryOptions.indexOf(a.slug) -
            MARKETS_SLUGS.binaryOptions.indexOf(b.slug)
          )
        })

      derivativeStore.$patch({
        perpetualMarkets: uiPerpetualMarketsWithToken,
        expiryFuturesMarkets: uiExpiryFuturesWithToken,
        recentlyExpiredMarkets: uiRecentlyExpiredMarkets,
        binaryOptionsMarkets: uiBinaryOptionsMarketsWithToken,
        markets: [
          ...uiExpiryFuturesWithToken,
          ...uiPerpetualMarketsWithToken,
          ...uiBinaryOptionsMarketsWithToken
        ]
      })

      await derivativeStore.fetchMarketsSummary()
    },

    async getMarketMarkPrice(market: UiDerivativeMarketWithToken) {
      const derivativeStore = useDerivativeStore()

      const oraclePrice =
        market.subType !== MarketType.BinaryOptions
          ? await indexerOracleApi.fetchOraclePrice({
              oracleType: market.oracleType,
              baseSymbol: (market as UiPerpetualMarketWithToken).oracleBase,
              quoteSymbol: (market as UiPerpetualMarketWithToken).oracleQuote
            })
          : await indexerOracleApi.fetchOraclePriceNoThrow({
              baseSymbol: (market as UiBinaryOptionsMarketWithToken)
                .oracleSymbol,
              quoteSymbol: (market as UiBinaryOptionsMarketWithToken)
                .oracleProvider,
              oracleType: market.oracleType
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

      derivativeStore.$patch({
        trades
      })
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const derivativeStore = useDerivativeStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

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

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

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
      const derivativeStore = useDerivativeStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          subaccountId,
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

      const marketSummaries =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = marketSummaries.filter(
        ({ marketId }) =>
          !markets.some((market) => market.marketId === marketId)
      )

      derivativeStore.$patch({
        marketsSummary: [
          ...marketSummaries.map(
            UiMarketTransformer.convertMarketSummaryToUiMarketSummary
          ),
          ...marketsWithoutMarketSummaries.map(({ marketId }) =>
            zeroDerivativeMarketSummary(marketId)
          )
        ]
      })
    },

    async fetchMarket(marketId: string) {
      const derivativeStore = useDerivativeStore()

      const updatedMarket = (await indexerDerivativesApi.fetchMarket(
        marketId
      )) as PerpetualMarket | ExpiryFuturesMarket

      const updatedMarketWithToken =
        await tokenService.toDerivativeMarketsWithToken([updatedMarket])

      const marketIndex = derivativeStore.markets.findIndex(
        (m) => m.marketId === marketId
      )

      if (marketIndex) {
        const markets = [...derivativeStore.markets]
        markets[marketIndex] = {
          ...markets[marketIndex],
          ...updatedMarketWithToken
        }

        derivativeStore.$patch({
          markets
        })
      }
    },

    async fetchSubaccountTrades(options?: ActivityFetchOptions | undefined) {
      const derivativeStore = useDerivativeStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        direction: filters?.direction,
        subaccountId,
        pagination: options?.pagination,
        executionTypes: filters?.executionTypes as TradeExecutionType[],
        marketIds: filters?.marketIds || derivativeStore.activeMarketIds
      })

      derivativeStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    cancelSubaccountStream() {
      const positionStore = usePositionStore()

      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrderHistoryStream()
      positionStore.cancelSubaccountPositionsStream()
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
