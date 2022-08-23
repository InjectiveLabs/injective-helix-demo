import { actionTree, getterTree } from 'typed-vuex'
import {
  BigNumberInBase,
  BigNumberInWei,
  derivativeMarginToChainMarginToFixed,
  derivativePriceToChainPriceToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  Change,
  derivativeOrderTypeToGrpcOrderType,
  DerivativesMetrics,
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
  ZERO_IN_BASE,
  ZERO_TO_STRING,
  zeroDerivativeMarketSummary
} from '@injectivelabs/sdk-ui-ts'
import {
  DerivativeOrderSide,
  DerivativeOrderState,
  ExpiryFuturesMarket,
  MsgBatchCancelBinaryOptionsOrders,
  MsgBatchCancelDerivativeOrders,
  MsgCreateBinaryOptionsLimitOrder,
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  PerpetualMarket
} from '@injectivelabs/sdk-ts'
import {
  streamOrderbook,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountTrades,
  streamMarketMarkPrice
} from '~/app/client/streams/derivatives'
import {
  FEE_RECIPIENT,
  IS_DEVNET,
  ORDERBOOK_STREAMING_ENABLED
} from '~/app/utils/constants'
import {
  indexerDerivativesApi,
  indexerOracleApi,
  indexerRestDerivativesChronosApi,
  msgBroadcastClient,
  tokenService
} from '~/app/Services'
import {
  perpetuals as allowedPerpetualMarkets,
  binaryOptions as allowedBinaryOptionsMarkets,
  expiryFutures as allowedExpiryFutures
} from '~/routes.config'
import { ActivityFetchOptions } from '~/types'

const initialStateFactory = () => ({
  perpetualMarkets: [] as UiPerpetualMarketWithToken[],
  expiryFuturesMarkets: [] as UiExpiryFuturesMarketWithToken[],
  binaryOptionsMarkets: [] as UiBinaryOptionsMarketWithToken[],
  markets: [] as UiDerivativeMarketWithToken[],
  marketsSummary: [] as UiDerivativeMarketSummary[],
  market: undefined as UiDerivativeMarketWithToken | undefined,
  marketMarkPrice: ZERO_TO_STRING as string,
  marketSummary: undefined as UiDerivativeMarketSummary | undefined,
  orderbook: undefined as UiDerivativeOrderbook | undefined,
  trades: [] as UiDerivativeTrade[],
  subaccountTrades: [] as UiDerivativeTrade[],
  subaccountTradesPagination: {
    endTime: 0 as number,
    total: 0 as number
  },
  subaccountOrders: [] as UiDerivativeLimitOrder[],
  subaccountOrdersPagination: {
    endTime: 0 as number,
    total: 0 as number
  },
  subaccountOrderHistory: [] as UiDerivativeOrderHistory[],
  subaccountOrderHistoryPagination: {
    endTime: 0 as number,
    total: 0 as number
  }
})

const initialState = initialStateFactory()

export const state = () => ({
  perpetualMarkets:
    initialState.perpetualMarkets as UiPerpetualMarketWithToken[],
  expiryFuturesMarkets:
    initialState.expiryFuturesMarkets as UiExpiryFuturesMarketWithToken[],
  binaryOptionsMarkets:
    initialState.binaryOptionsMarkets as UiBinaryOptionsMarketWithToken[],
  markets: initialState.markets as UiDerivativeMarketWithToken[],
  marketsSummary: initialState.marketsSummary as UiDerivativeMarketSummary[],
  market: initialState.market as UiDerivativeMarketWithToken | undefined,
  marketSummary: initialState.marketSummary as
    | UiDerivativeMarketSummary
    | undefined,
  marketMarkPrice: initialState.marketMarkPrice as string,
  trades: initialState.trades as UiDerivativeTrade[],
  subaccountTrades: initialState.subaccountTrades as UiDerivativeTrade[],
  subaccountTradesPagination: initialState.subaccountTradesPagination,
  subaccountOrders: initialState.subaccountOrders as UiDerivativeLimitOrder[],
  subaccountOrdersPagination: initialState.subaccountOrdersPagination,
  subaccountOrderHistory: initialState.subaccountOrderHistory as UiDerivativeOrderHistory[],
  subaccountOrderHistoryPagination: initialState.subaccountOrderHistoryPagination,
  orderbook: initialState.orderbook as UiDerivativeOrderbook | undefined
})

export type DerivativeStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  marketSelected: (state) => {
    return !!state.market
  },

  lastTradedPrice: (state) => {
    if (!state.market) {
      return ZERO_IN_BASE
    }

    if (state.trades.length === 0) {
      return ZERO_IN_BASE
    }

    const [trade] = state.trades

    return new BigNumberInBase(
      new BigNumberInWei(trade.executionPrice).toBase(
        state.market.quoteToken.decimals
      )
    )
  },

  lastTradedPriceChange: (state): Change => {
    if (!state.market) {
      return Change.NoChange
    }

    if (state.trades.length === 0) {
      return Change.NoChange
    }

    const [trade] = state.trades
    const [secondLastTrade] = state.trades.filter(
      (t) => !new BigNumberInBase(t.executionPrice).eq(trade.executionPrice)
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(trade.executionPrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.executionPrice)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  },

  activeMarketIds: (state) => state.markets.map((m) => m.marketId)
})

export const mutations = {
  setMarket(state: DerivativeStoreState, market: UiDerivativeMarketWithToken) {
    state.market = market
  },

  setMarkets(
    state: DerivativeStoreState,
    markets: UiDerivativeMarketWithToken[]
  ) {
    state.markets = markets
  },

  setMarketSummary(
    state: DerivativeStoreState,
    marketSummary: UiDerivativeMarketSummary
  ) {
    state.marketSummary = marketSummary
  },

  setMarketMarkPrice(state: DerivativeStoreState, marketMarkPrice: string) {
    state.marketMarkPrice = marketMarkPrice
  },

  setPerpetualMarkets(
    state: DerivativeStoreState,
    markets: UiPerpetualMarketWithToken[]
  ) {
    state.perpetualMarkets = markets
  },

  setExpiryFuturesMarkets(
    state: DerivativeStoreState,
    markets: UiExpiryFuturesMarketWithToken[]
  ) {
    state.expiryFuturesMarkets = markets
  },

  setBinaryOptionsMarkets(
    state: DerivativeStoreState,
    markets: UiBinaryOptionsMarketWithToken[]
  ) {
    state.binaryOptionsMarkets = markets
  },

  resetMarket(state: DerivativeStoreState) {
    const initialState = initialStateFactory()

    state.market = initialState.market
    state.marketSummary = initialState.marketSummary
    state.marketMarkPrice = initialState.marketMarkPrice
    state.orderbook = initialState.orderbook
    state.trades = initialState.trades
    state.subaccountOrders = initialState.subaccountOrders
    state.subaccountTrades = initialState.subaccountTrades
  },

  setMarketsSummary(
    state: DerivativeStoreState,
    marketsSummary: UiDerivativeMarketSummary[]
  ) {
    state.marketsSummary = marketsSummary
  },

  setTrades(state: DerivativeStoreState, trades: UiDerivativeTrade[]) {
    state.trades = trades
  },

  pushTrade(state: DerivativeStoreState, trade: UiDerivativeTrade) {
    state.trades = [trade, ...state.trades]
  },

  setSubaccountTrades(
    state: DerivativeStoreState,
    subaccountTrades: UiDerivativeTrade[]
  ) {
    state.subaccountTrades = subaccountTrades
  },

  setSubaccountTradesEndTime(state: DerivativeStoreState, endTime: number) {
    state.subaccountTradesPagination.endTime = endTime
  },

  setSubaccountTradesTotal(state: DerivativeStoreState, total: number) {
    state.subaccountTradesPagination.total = total
  },

  setSubaccountOrders(
    state: DerivativeStoreState,
    subaccountOrders: UiDerivativeLimitOrder[]
  ) {
    state.subaccountOrders = subaccountOrders
  },

  setSubaccountOrdersEndTime(state: DerivativeStoreState, endTime: number) {
    state.subaccountOrdersPagination.endTime = endTime
  },

  setSubaccountOrdersTotal(state: DerivativeStoreState, total: number) {
    state.subaccountOrdersPagination.total = total
  },

  setSubaccountOrderHistory(state: DerivativeStoreState, orderHistory: UiDerivativeOrderHistory[]) {
    state.subaccountOrderHistory = orderHistory
  },

  setSubaccountOrderHistoryEndTime(state: DerivativeStoreState, endTime: number) {
    state.subaccountOrderHistoryPagination.endTime = endTime
  },

  setSubaccountOrderHistoryTotal(state: DerivativeStoreState, total: number) {
    state.subaccountOrderHistoryPagination.total = total
  },

  pushSubaccountOrder(
    state: DerivativeStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    state.subaccountOrders = [subaccountOrder, ...state.subaccountOrders]
  },

  updateSubaccountOrder(
    state: DerivativeStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    if (subaccountOrder.orderHash) {
      state.subaccountOrders = state.subaccountOrders.map((order) => {
        return order.orderHash === subaccountOrder.orderHash
          ? subaccountOrder
          : order
      })
    }
  },

  pushOrUpdateSubaccountOrder(
    state: DerivativeStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = [subaccountOrder, ...subaccountOrders]
  },

  deleteSubaccountOrder(
    state: DerivativeStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = subaccountOrders
  },

  pushSubaccountTrade(
    state: DerivativeStoreState,
    subaccountTrade: UiDerivativeTrade
  ) {
    state.subaccountTrades = [subaccountTrade, ...state.subaccountTrades]
  },

  updateSubaccountTrade(
    state: DerivativeStoreState,
    subaccountTrade: UiDerivativeTrade
  ) {
    if (subaccountTrade.orderHash) {
      state.subaccountTrades = state.subaccountTrades.map((order) => {
        return order.orderHash === subaccountTrade.orderHash
          ? subaccountTrade
          : order
      })
    }
  },

  deleteSubaccountTrade(
    state: DerivativeStoreState,
    subaccountTrade: UiDerivativeTrade
  ) {
    const subaccountTrades = [...state.subaccountTrades].filter(
      (order) => order.orderHash !== subaccountTrade.orderHash
    )

    state.subaccountTrades = subaccountTrades
  },

  setOrderbook(state: DerivativeStoreState, orderbook: UiDerivativeOrderbook) {
    state.orderbook = orderbook
  },

  resetSubaccount(state: DerivativeStoreState) {
    const initialState = initialStateFactory()

    state.subaccountTrades = initialState.subaccountTrades
    state.subaccountOrders = initialState.subaccountOrders
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async reset({ commit }) {
      commit('resetMarket')
      await this.app.$accessor.app.cancelAllStreams()
    },

    async init({ commit }) {
      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >
      const marketsWithToken = await tokenService.getDerivativeMarketsWithToken(
        markets
      )
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
      const binaryOptionsMarkets = IS_DEVNET
        ? await indexerDerivativesApi.fetchBinaryOptionsMarkets()
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

      commit('setPerpetualMarkets', uiPerpetualMarketsWithToken)
      commit('setExpiryFuturesMarkets', uiExpiryFuturesWithToken)
      commit('setBinaryOptionsMarkets', uiBinaryOptionsMarketsWithToken)
      commit('setMarkets', [
        ...uiPerpetualMarketsWithToken,
        ...uiExpiryFuturesWithToken,
        ...uiBinaryOptionsMarketsWithToken
      ])

      const marketsSummary =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()
      const marketSummaryNotExists =
        !marketsSummary || (marketsSummary && marketsSummary.length === 0)
      const actualMarketsSummary = marketSummaryNotExists
        ? markets.map((market) => zeroDerivativeMarketSummary(market.marketId))
        : marketsSummary

      commit(
        'setMarketsSummary',
        actualMarketsSummary as UiDerivativeMarketSummary[]
      )
    },

    async initMarket({ commit, state }, marketSlug: string) {
      const { markets } = state

      if (!markets.length) {
        await this.app.$accessor.derivatives.init()
      }

      const { markets: newMarkets } = state

      const market = newMarkets.find(
        (market) =>
          marketSlug && market.slug.toLowerCase() === marketSlug.toLowerCase()
      )

      if (!market) {
        throw new Error('Market not found. Please refresh the page.')
      }

      const summary = await indexerRestDerivativesChronosApi.fetchMarketSummary(
        market.marketId
      )

      commit('setMarket', market)
      commit('setMarketSummary', {
        ...summary,
        marketId: market.marketId
      })

      await this.app.$accessor.derivatives.getMarketMarkPrice()

      if (ORDERBOOK_STREAMING_ENABLED) {
        await this.app.$accessor.derivatives.streamOrderbook()
      }
    },

    async initMarketStreams({ state }) {
      const { market } = state

      if (!market) {
        return
      }

      await this.app.$accessor.derivatives.streamTrades()
      await this.app.$accessor.derivatives.streamMarketMarkPrices()
      await this.app.$accessor.derivatives.streamSubaccountOrders()
      await this.app.$accessor.derivatives.streamSubaccountTrades()
      await this.app.$accessor.positions.streamSubaccountPositions()
      await this.app.$accessor.account.streamSubaccountBalances()
    },

    async getMarketMarkPrice({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

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

      commit('setMarketMarkPrice', oraclePrice.price)
    },

    async pollOrderbook({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      commit(
        'setOrderbook',
        await indexerDerivativesApi.fetchOrderbook(market.marketId)
      )
    },

    streamOrderbook({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      streamOrderbook({
        marketId: market.marketId,
        callback: ({ orderbook }) => {
          if (!orderbook) {
            return
          }

          commit('setOrderbook', orderbook)
        }
      })
    },

    streamTrades({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      streamTrades({
        marketId: market.marketId,
        callback: ({ trade, operation }) => {
          if (!trade) {
            return
          }

          switch (operation) {
            case StreamOperation.Insert:
              commit('pushTrade', trade)
          }
        }
      })
    },

    streamMarketMarkPrices({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      if (market.subType === MarketType.BinaryOptions) {
        return
      }

      streamMarketMarkPrice({
        market,
        callback: ({ price, operation }) => {
          if (!price) {
            return
          }

          switch (operation) {
            case StreamOperation.Update:
              commit('setMarketMarkPrice', price)
          }
        }
      })
    },

    streamSubaccountOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountOrders({
        subaccountId: subaccount.subaccountId,
        callback: ({ order }) => {
          if (!order) {
            return
          }

          switch (order.state) {
            case DerivativeOrderState.Booked:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case DerivativeOrderState.Unfilled:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case DerivativeOrderState.PartialFilled:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case DerivativeOrderState.Canceled:
              commit('deleteSubaccountOrder', order)
              break
            case DerivativeOrderState.Filled:
              commit('deleteSubaccountOrder', order)
              break
          }
        }
      })
    },

    streamSubaccountTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountTrades({
        subaccountId: subaccount.subaccountId,
        callback: ({ trade, operation }) => {
          if (!trade) {
            return
          }

          switch (operation) {
            case StreamOperation.Insert:
              commit('pushSubaccountTrade', trade)
              break
            case StreamOperation.Delete:
              commit('deleteSubaccountTrade', trade)
              break
            case StreamOperation.Update:
              commit('updateSubaccountTrade', trade)
              break
          }
        }
      })
    },

    async fetchOrderbook({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      commit(
        'setOrderbook',
        await indexerDerivativesApi.fetchOrderbook(market.marketId)
      )
    },

    async fetchTrades({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      const { trades } = await indexerDerivativesApi.fetchTrades({
        marketId: market.marketId
      })

      commit('setTrades', trades)
    },

    async fetchSubaccountOrders(
      { commit },
      activityFetchOptions: ActivityFetchOptions | undefined
    ) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters

      const { orders, pagination } = await indexerDerivativesApi.fetchOrders({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        orderSide: filters?.orderSide as DerivativeOrderSide,
        pagination: {
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      commit('setSubaccountOrdersTotal', pagination.total)
      commit('setSubaccountOrders', orders)
    },

    async fetchOrderHistory({ commit }, activityFetchOptions: ActivityFetchOptions | undefined) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters

      const { orderHistory } = await indexerDerivativesApi.fetchOrderHistory({
        marketId: filters?.marketId,
        subaccountId: subaccount.subaccountId,
        orderType: filters?.orderType as DerivativeOrderSide | undefined,
        direction: filters?.direction,
        isConditional: filters?.isConditional,
        pagination: {
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0
        }
      })

      commit('setSubaccountOrderHistory', orderHistory)
    },

    async fetchMarketsSummary({ state, commit }) {
      const { marketsSummary, market, markets } = state

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary =
        await indexerRestDerivativesChronosApi.fetchMarketsSummary()
      const combinedMarketsSummary =
        UiDerivativeTransformer.derivativeMarketsSummaryComparisons(
          updatedMarketsSummary,
          state.marketsSummary
        )

      if (
        !combinedMarketsSummary ||
        (combinedMarketsSummary && combinedMarketsSummary.length === 0)
      ) {
        commit(
          'setMarketsSummary',
          markets.map((market) => zeroDerivativeMarketSummary(market.marketId))
        )
      } else {
        if (market) {
          const updatedMarketSummary = combinedMarketsSummary.find(
            (m) => m.marketId === market.marketId
          )

          if (updatedMarketSummary) {
            commit('setMarketSummary', updatedMarketSummary)
          }
        }

        commit('setMarketsSummary', combinedMarketsSummary)
      }
    },

    async fetchMarket({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      const updatedMarket = await indexerDerivativesApi.fetchMarket(
        market.marketId
      )

      commit('setMarket', {
        ...updatedMarket,
        ...market
      })
    },

    async fetchSubaccountTrades(
      { state, commit },
      activityFetchOptions: ActivityFetchOptions | undefined
    ) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (
        state.subaccountTrades.length > 0 &&
        state.subaccountTradesPagination.endTime === 0
      ) {
        commit(
          'setSubaccountTradesEndTime',
          state.subaccountTrades[0].executedAt
        )
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters

      const { trades, pagination } = await indexerDerivativesApi.fetchTrades({
        marketId: filters?.marketId,
        marketIds: filters?.marketIds,
        subaccountId: subaccount.subaccountId,
        executionTypes: filters?.types,
        direction: filters?.direction,
        pagination: {
          skip: paginationOptions ? paginationOptions.skip : 0,
          limit: paginationOptions ? paginationOptions.limit : 0,
          endTime: state.subaccountTradesPagination.endTime
        }
      })

      commit('setSubaccountTradesTotal', pagination.total)
      commit('setSubaccountTrades', trades)
    },

    async cancelOrder({ state }, order: UiDerivativeLimitOrder) {
      const { markets } = state
      const { subaccount } = this.app.$accessor.account
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const market = markets.find((m) => m.marketId === order.marketId)
      const messageType =
        market && market.subType === MarketType.BinaryOptions
          ? MsgBatchCancelBinaryOptionsOrders
          : MsgBatchCancelDerivativeOrders

      const message = messageType.fromJSON({
        injectiveAddress,
        orders: [
          {
            marketId: order.marketId,
            subaccountId: order.subaccountId,
            orderHash: order.orderHash
          }
        ]
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.BatchCancelLimitOrders
      })
    },

    async batchCancelOrder({ state }, orders: UiDerivativeLimitOrder[]) {
      const { markets } = state
      const { subaccount } = this.app.$accessor.account
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const messages = orders.map((order) => {
        const market = markets.find((m) => m.marketId === order.marketId)
        const messageType =
          market && market.subType === MarketType.BinaryOptions
            ? MsgBatchCancelBinaryOptionsOrders
            : MsgBatchCancelDerivativeOrders

        return messageType.fromJSON({
          injectiveAddress,
          orders: [
            {
              marketId: order.marketId,
              subaccountId: order.subaccountId,
              orderHash: order.orderHash
            }
          ]
        })
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: messages,
        bucket: DerivativesMetrics.BatchCancelLimitOrders
      })
    },

    async submitLimitOrder(
      { state },
      {
        price,
        reduceOnly,
        margin,
        quantity,
        orderType
      }: {
        reduceOnly: boolean
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderSide
      }
    ) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const messageType =
        market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsLimitOrder
          : MsgCreateDerivativeLimitOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: reduceOnly
          ? ZERO_TO_STRING
          : derivativeMarginToChainMarginToFixed({
              value: margin,
              quoteDecimals: market.quoteToken.decimals
            }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateLimitOrder
      })
    },

    async submitMarketOrder(
      { state },
      {
        quantity,
        price,
        margin,
        reduceOnly,
        orderType
      }: {
        reduceOnly: boolean
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderSide
      }
    ) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const messageType =
        market && market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        triggerPrice: '0',
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: reduceOnly
          ? ZERO_TO_STRING
          : derivativeMarginToChainMarginToFixed({
              value: margin,
              quoteDecimals: market.quoteToken.decimals
            }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateMarketOrder
      })
    }
  }
)
