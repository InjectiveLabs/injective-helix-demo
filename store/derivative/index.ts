import { defineStore } from 'pinia'
import { TradeExecutionSide, TradeExecutionType } from '@injectivelabs/ts-types'
import {
  MarketType,
  UiBinaryOptionsMarketWithToken,
  UiDerivativeLimitOrder,
  UiDerivativeOrderHistory,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiDerivativeTrade,
  UiDerivativeTransformer,
  UiExpiryFuturesMarketWithToken,
  UiPerpetualMarketWithToken,
  ZERO_TO_STRING,
  zeroDerivativeMarketSummary
} from '@injectivelabs/sdk-ui-ts'
import {
  BinaryOptionsMarket,
  DerivativeOrderSide,
  DerivativeOrderState,
  ExpiryFuturesMarket,
  PerpetualMarket
} from '@injectivelabs/sdk-ts'
import { IS_DEVNET, MARKETS_SLUGS } from '@/app/utils/constants'
import {
  indexerDerivativesApi,
  indexerOracleApi,
  indexerRestDerivativesChronosApi,
  tokenService
} from '@/app/Services'
import { UiMarketTransformer } from '@/app/client/transformers/UiMarketTransformer'
import { marketHasRecentlyExpired } from '@/app/utils/market'
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitStopLimitOrder,
  submitMarketOrder,
  submitStopMarketOrder
} from '@/store/derivative/message'
import {
  streamOrderbook,
  streamTrades,
  cancelSubaccountOrdersStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream,
  streamSubaccountTrades,
  streamSubaccountOrders,
  streamMarketMarkPrices,
  cancelSubaccountTradesStream
} from '@/store/derivative/stream'
import { ActivityFetchOptions, UiMarketAndSummary } from '@/types'

type DerivativeStoreState = {
  perpetualMarkets: UiPerpetualMarketWithToken[]
  expiryFuturesMarkets: UiExpiryFuturesMarketWithToken[]
  recentlyExpiredMarkets: UiExpiryFuturesMarketWithToken[]
  binaryOptionsMarkets: UiBinaryOptionsMarketWithToken[]
  markets: UiDerivativeMarketWithToken[]
  marketsSummary: UiDerivativeMarketSummary[]
  marketMarkPrice: string
  trades: UiDerivativeTrade[]
  orderbook?: UiDerivativeOrderbook
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
  marketMarkPrice: ZERO_TO_STRING,
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
    submitStopLimitOrder,
    submitMarketOrder,
    submitStopMarketOrder,

    streamOrderbook,
    streamTrades,
    cancelSubaccountOrdersStream,
    streamSubaccountOrderHistory,
    cancelSubaccountOrderHistoryStream,
    streamSubaccountTrades,
    streamSubaccountOrders,
    streamMarketMarkPrices,
    cancelSubaccountTradesStream,

    reset() {
      const derivativeStore = useDerivativeStore()

      const initialState = initialStateFactory()

      derivativeStore.$patch({
        marketMarkPrice: initialState.marketMarkPrice,
        orderbook: initialState.orderbook,
        trades: initialState.trades,
        subaccountOrders: initialState.subaccountOrders,
        subaccountTrades: initialState.subaccountTrades
      })
    },

    async init() {
      const derivativeStore = useDerivativeStore()

      await derivativeStore.fetchMarketsSummary()

      const marketsAlreadyFetched = derivativeStore.markets.length

      if (marketsAlreadyFetched) {
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

      const marketsWithToken = await tokenService.getDerivativeMarketsWithToken(
        markets
      )
      const recentlyExpiredMarketsWithToken =
        await tokenService.getDerivativeMarketsWithToken(recentlyExpiredMarkets)

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
        await tokenService.getBinaryOptionsMarketsWithToken(
          binaryOptionsMarkets
        )
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
          ...uiPerpetualMarketsWithToken,
          ...uiExpiryFuturesWithToken,
          ...uiBinaryOptionsMarketsWithToken
        ]
      })
    },

    async getMarketMarkPrice(market: UiDerivativeMarketWithToken) {
      const derivativeStore = useDerivativeStore()

      const oraclePrice =
        market.subType !== MarketType.BinaryOptions
          ? await indexerOracleApi.fetchOraclePrice({
              baseSymbol: (market as UiPerpetualMarketWithToken).oracleBase,
              quoteSymbol: (market as UiPerpetualMarketWithToken).oracleQuote,
              oracleType: market.oracleType
            })
          : await indexerOracleApi.fetchOraclePriceNoThrow({
              baseSymbol: (market as UiBinaryOptionsMarketWithToken)
                .oracleSymbol,
              quoteSymbol: (market as UiBinaryOptionsMarketWithToken)
                .oracleProvider,
              oracleType: market.oracleType
            })

      derivativeStore.$patch({
        marketMarkPrice: oraclePrice.price
      })
    },

    async fetchOrderbook(marketId: string) {
      const derivativeStore = useDerivativeStore()

      derivativeStore.$patch({
        orderbook: await indexerDerivativesApi.fetchOrderbook(marketId)
      })
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

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        marketIds: marketIds || derivativeStore.activeMarketIds,
        subaccountId: subaccount.subaccountId,
        isConditional: false
      })

      derivativeStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })
    },

    async fetchSubaccountOrderHistory(
      options: ActivityFetchOptions | undefined
    ) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as DerivativeOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: filters?.isConditional,
          pagination: options?.pagination
        })

      derivativeStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchSubaccountConditionalOrders(marketIds?: string[]) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          marketIds: marketIds || derivativeStore.activeMarketIds,
          subaccountId: subaccount.subaccountId,
          isConditional: true,
          state: DerivativeOrderState.Booked
        })

      derivativeStore.$patch({
        subaccountConditionalOrders: orderHistory,
        subaccountConditionalOrdersCount: pagination.total
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
        await tokenService.getDerivativeMarketsWithToken([updatedMarket])

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

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
        subaccountId: subaccount.subaccountId,
        executionTypes: filters?.executionTypes as TradeExecutionType[],
        direction: filters?.direction,
        pagination: options?.pagination
      })

      derivativeStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    cancelSubaccountStream() {
      const positionStore = usePositionStore()

      positionStore.cancelSubaccountPositionsStream()
      cancelSubaccountOrderHistoryStream()
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
    },

    resetSubaccount() {
      const derivativeStore = useDerivativeStore()
      const initialState = initialStateFactory()

      derivativeStore.cancelSubaccountStream()

      derivativeStore.$patch({
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
