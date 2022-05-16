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
  UiDerivativeLimitOrder,
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiDerivativeTrade,
  DerivativeTransformer,
  zeroDerivativeMarketSummary,
  ZERO_IN_BASE,
  ZERO_TO_STRING,
  Change
} from '@injectivelabs/ui-common'
import {
  DerivativeOrderSide,
  DerivativeOrderState
} from '@injectivelabs/derivatives-consumer'
import {
  streamOrderbook,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountTrades,
  streamMarketMarkPrice
} from '~/app/streams/derivatives'
import {
  FEE_RECIPIENT,
  ORDERBOOK_STREAMING_ENABLED
} from '~/app/utils/constants'
import {
  derivativeActionService,
  derivativeService,
  tokenService
} from '~/app/Services'
import { derivatives as allowedPerpetualMarkets } from '~/routes.config'

const initialStateFactory = () => ({
  markets: [] as UiDerivativeMarketWithToken[],
  marketsSummary: [] as UiDerivativeMarketSummary[],
  market: undefined as UiDerivativeMarketWithToken | undefined,
  marketMarkPrice: ZERO_TO_STRING as string,
  marketSummary: undefined as UiDerivativeMarketSummary | undefined,
  orderbook: undefined as UiDerivativeOrderbook | undefined,
  trades: [] as UiDerivativeTrade[],
  subaccountTrades: [] as UiDerivativeTrade[],
  subaccountOrders: [] as UiDerivativeLimitOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiDerivativeMarketWithToken[],
  marketsSummary: initialState.marketsSummary as UiDerivativeMarketSummary[],
  market: initialState.market as UiDerivativeMarketWithToken | undefined,
  marketSummary: initialState.marketSummary as
    | UiDerivativeMarketSummary
    | undefined,
  marketMarkPrice: initialState.marketMarkPrice as string,
  trades: initialState.trades as UiDerivativeTrade[],
  subaccountTrades: initialState.subaccountTrades as UiDerivativeTrade[],
  subaccountOrders: initialState.subaccountOrders as UiDerivativeLimitOrder[],
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
  }
})

export const mutations = {
  setMarket(state: DerivativeStoreState, market: UiDerivativeMarketWithToken) {
    state.market = market
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

  setMarkets(
    state: DerivativeStoreState,
    markets: UiDerivativeMarketWithToken[]
  ) {
    state.markets = markets
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

  setSubaccountOrders(
    state: DerivativeStoreState,
    subaccountOrders: UiDerivativeLimitOrder[]
  ) {
    state.subaccountOrders = subaccountOrders
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
      const markets = await derivativeService.fetchMarkets()
      const marketsWithToken = await tokenService.getDerivativeMarketsWithToken(
        markets
      )
      const uiMarkets = DerivativeTransformer.derivativeMarketsToUiSpotMarkets(
        marketsWithToken
      )

      // Only include markets that we pre-defined to generate static routes for
      const uiMarketsWithToken = uiMarkets
        .filter((market) => {
          return allowedPerpetualMarkets.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            allowedPerpetualMarkets.indexOf(a.slug) -
            allowedPerpetualMarkets.indexOf(b.slug)
          )
        })

      commit('setMarkets', uiMarketsWithToken)

      const marketsSummary = await derivativeService.fetchMarketsSummary()
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
        (market) => market.slug.toLowerCase() === marketSlug.toLowerCase()
      )

      if (!market) {
        throw new Error('Market not found. Please refresh the page.')
      }

      commit('setMarket', market)
      commit(
        'setMarketSummary',
        await derivativeService.fetchMarketSummary(market.marketId)
      )
      commit(
        'setMarketMarkPrice',
        await derivativeService.fetchMarketMarkPrice(market)
      )

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

    async pollOrderbook({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      commit(
        'setOrderbook',
        await derivativeService.fetchOrderbook(market.marketId)
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
        await derivativeService.fetchOrderbook(market.marketId)
      )
    },

    async fetchTrades({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      commit(
        'setTrades',
        await derivativeService.fetchTrades({ marketId: market.marketId })
      )
    },

    async fetchSubaccountOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountOrders',
        await derivativeService.fetchOrders({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchMarketsSummary({ state, commit }) {
      const { marketsSummary, markets, market } = state

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary = await derivativeService.fetchMarketsSummary()
      const combinedMarketsSummary = DerivativeTransformer.marketsSummaryComparisons(
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

      const updatedMarket = await derivativeService.fetchMarket(market.marketId)

      commit('setMarket', {
        ...updatedMarket,
        ...market
      })
    },

    async fetchSubaccountTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const trades = await derivativeService.fetchTrades({
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountTrades', trades)
    },

    async cancelOrder(_, order: UiDerivativeLimitOrder) {
      const { subaccount } = this.app.$accessor.account
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await derivativeActionService.cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        marketId: order.marketId,
        subaccountId: subaccount.subaccountId
      })
    },

    async batchCancelOrder(_, orders: UiDerivativeLimitOrder[]) {
      const { subaccount } = this.app.$accessor.account
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await derivativeActionService.batchCancelOrders({
        injectiveAddress,
        address,
        orders: orders.map((o) => ({
          orderHash: o.orderHash,
          subaccountId: o.subaccountId,
          marketId: o.marketId
        }))
      })
    },

    async submitLimitOrder(
      _,
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
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await derivativeActionService.submitLimitOrder({
        reduceOnly,
        orderType,
        injectiveAddress,
        address,
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: derivativeMarginToChainMarginToFixed({
          value: margin,
          quoteDecimals: market.quoteToken.decimals
        }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })
    },

    async submitMarketOrder(
      _,
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
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await derivativeActionService.submitMarketOrder({
        reduceOnly,
        orderType,
        injectiveAddress,
        address,
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: derivativeMarginToChainMarginToFixed({
          value: margin,
          quoteDecimals: market.quoteToken.decimals
        }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })
    }
  }
)
