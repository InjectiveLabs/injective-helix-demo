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
import { IS_DEVNET } from '@/app/utils/constants'
import {
  indexerDerivativesApi,
  indexerOracleApi,
  indexerRestDerivativesChronosApi,
  tokenService
} from '@/app/Services'
import {
  perpetuals as allowedPerpetualMarkets,
  binaryOptions as allowedBinaryOptionsMarkets,
  expiryFutures as allowedExpiryFutures
} from '@/nuxt-config/hooks/route'
import { ActivityFetchOptions } from '@/types'
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

type DerivativeStoreState = {
  perpetualMarkets: UiPerpetualMarketWithToken[]
  expiryFuturesMarkets: UiExpiryFuturesMarketWithToken[]
  recentlyExpiredMarkets: UiExpiryFuturesMarketWithToken[]
  binaryOptionsMarkets: UiBinaryOptionsMarketWithToken[]
  markets: UiDerivativeMarketWithToken[]
  marketsSummary: UiDerivativeMarketSummary[]
  marketMarkPrice: string
  orderbook?: UiDerivativeOrderbook
  trades: UiDerivativeTrade[]
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
    activeMarketIds: (state) => state.markets.map((m) => m.marketId),

    buys: (state) => state.orderbook?.buys || [],

    sells: (state) => state.orderbook?.sells || []
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

      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >
      const recentlyExpiredMarkets = (
        (await indexerDerivativesApi.fetchMarkets({
          marketStatus: 'expired'
        })) as Array<ExpiryFuturesMarket>
      ).filter(marketHasRecentlyExpired)

      const marketsSummary =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()

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
          return allowedPerpetualMarkets.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            allowedPerpetualMarkets.indexOf(a.slug) -
            allowedPerpetualMarkets.indexOf(b.slug)
          )
        })
      const uiExpiryFuturesWithToken = uiExpiryFuturesMarkets
        .filter((market) => {
          return allowedExpiryFutures.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            allowedExpiryFutures.indexOf(a.slug) -
            allowedExpiryFutures.indexOf(b.slug)
          )
        })
      const uiBinaryOptionsMarketsWithToken = uiBinaryOptionsMarkets
        .filter((market) => {
          return allowedBinaryOptionsMarkets.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            allowedBinaryOptionsMarkets.indexOf(a.slug) -
            allowedBinaryOptionsMarkets.indexOf(b.slug)
          )
        })

      const actualMarketsSummary =
        marketsSummary && marketsSummary.length > 0
          ? marketsSummary
          : [zeroDerivativeMarketSummary('')]

      derivativeStore.$patch({
        perpetualMarkets: uiPerpetualMarketsWithToken,
        expiryFuturesMarkets: uiExpiryFuturesWithToken,
        recentlyExpiredMarkets: uiRecentlyExpiredMarkets,
        binaryOptionsMarkets: uiBinaryOptionsMarketsWithToken,
        markets: [
          ...uiPerpetualMarketsWithToken,
          ...uiExpiryFuturesWithToken,
          ...uiBinaryOptionsMarketsWithToken
        ],
        marketsSummary: actualMarketsSummary
      })
    },

    async initMarketStreams(market: UiDerivativeMarketWithToken) {
      const accountStore = useAccountStore()
      const positionStore = usePositionStore()
      const derivativeStore = useDerivativeStore()

      await derivativeStore.streamOrderbook(market.marketId)
      await derivativeStore.streamTrades(market.marketId)
      await derivativeStore.streamMarketMarkPrices(market)
      await derivativeStore.streamSubaccountOrders(market.marketId)
      await derivativeStore.streamSubaccountOrderHistory()
      await derivativeStore.streamSubaccountTrades(market.marketId)
      await positionStore.streamSubaccountPositions()
      await accountStore.streamSubaccountBalances()
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
        marketId,
        executionSide
      })

      derivativeStore.$patch({
        trades
      })
    },

    async fetchSubaccountOrders(
      activityFetchOptions?: ActivityFetchOptions | undefined
    ) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime =
        paginationOptions?.endTime !== undefined
          ? paginationOptions?.endTime
          : derivativeStore.subaccountOrders[0]?.updatedAt || 0

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        orderSide: (filters?.orderSide as DerivativeOrderSide) || undefined,
        isConditional: false,
        pagination: {
          endTime,
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      derivativeStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: pagination.total
      })
    },

    async fetchSubaccountOrderHistory(
      activityFetchOptions: ActivityFetchOptions | undefined
    ) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime =
        paginationOptions?.endTime !== undefined
          ? paginationOptions?.endTime
          : derivativeStore.subaccountOrderHistory[0]?.createdAt || 0

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          marketId: filters?.marketId,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as DerivativeOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: filters?.isConditional,
          pagination: {
            endTime,
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0
          }
        })

      derivativeStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchSubaccountConditionalOrders(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime =
        paginationOptions?.endTime !== undefined
          ? paginationOptions?.endTime
          : derivativeStore.subaccountConditionalOrders[0]?.createdAt || 0

      const { orderHistory, pagination } =
        await indexerDerivativesApi.fetchOrderHistory({
          marketId: filters?.marketId,
          subaccountId: subaccount.subaccountId,
          orderTypes: filters?.orderTypes as unknown as DerivativeOrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[],
          direction: filters?.direction,
          isConditional: true,
          state: DerivativeOrderState.Booked,
          pagination: {
            endTime,
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0
          }
        })

      derivativeStore.$patch({
        subaccountConditionalOrders: orderHistory,
        subaccountConditionalOrdersCount: pagination.total
      })
    },

    async fetchMarketsSummary() {
      const derivativeStore = useDerivativeStore()

      const { marketsSummary, markets } = derivativeStore

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()
      const combinedMarketsSummary =
        UiDerivativeTransformer.derivativeMarketsSummaryComparisons(
          updatedMarketsSummary,
          derivativeStore.marketsSummary
        )

      if (
        !combinedMarketsSummary ||
        (combinedMarketsSummary && combinedMarketsSummary.length === 0)
      ) {
        derivativeStore.$patch({
          marketsSummary: markets.map((market) =>
            zeroDerivativeMarketSummary(market.marketId)
          )
        })
      } else {
        derivativeStore.$patch({
          marketsSummary: combinedMarketsSummary
        })
      }
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

    async fetchSubaccountTrades(
      activityFetchOptions?: ActivityFetchOptions | undefined
    ) {
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime =
        paginationOptions?.endTime !== undefined
          ? paginationOptions?.endTime
          : derivativeStore.subaccountTrades[0]?.executedAt || 0

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        executionTypes: filters?.types,
        direction: filters?.direction,
        pagination: {
          endTime,
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      derivativeStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    resetSubaccount() {
      const derivativeStore = useDerivativeStore()

      const initialState = initialStateFactory()

      derivativeStore.$patch({
        subaccountTrades: initialState.subaccountTrades,
        subaccountOrders: initialState.subaccountOrders
      })
    }
  }
})
