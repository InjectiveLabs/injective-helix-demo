import { actionTree, getterTree } from 'typed-vuex'
import { BigNumberInBase } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import { SpotOrderState } from '@injectivelabs/spot-consumer'
import {
  UiSpotOrderbook,
  UiSpotLimitOrder,
  UiSpotTrade,
  UiSpotMarket,
  SpotOrderSide,
  UiSpotMarketSummary,
  Change
} from '~/types'
import {
  fetchMarketOrderbook,
  fetchMarketOrders,
  fetchMarkets,
  fetchMarketsSummary,
  fetchMarketSummary,
  fetchMarketTrades,
  submitLimitOrder,
  submitMarketOrder,
  cancelOrder,
  streamOrderbook,
  cancelMarketStreams,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountTrades,
  batchCancelOrders
} from '~/app/services/spot'
import { ZERO_IN_BASE } from '~/app/utils/constants'

const initialStateFactory = () => ({
  markets: [] as UiSpotMarket[],
  marketsSummary: [] as UiSpotMarketSummary[],
  market: undefined as UiSpotMarket | undefined,
  marketSummary: undefined as UiSpotMarketSummary | undefined,
  orderbook: undefined as UiSpotOrderbook | undefined,
  trades: [] as UiSpotTrade[],
  subaccountTrades: [] as UiSpotTrade[],
  subaccountOrders: [] as UiSpotLimitOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiSpotMarket[],
  marketsSummary: initialState.marketsSummary as UiSpotMarketSummary[],
  market: initialState.market as UiSpotMarket | undefined,
  marketSummary: initialState.marketSummary as UiSpotMarketSummary | undefined,
  trades: initialState.trades as UiSpotTrade[],
  subaccountTrades: initialState.subaccountTrades as UiSpotTrade[],
  subaccountOrders: initialState.subaccountOrders as UiSpotLimitOrder[],
  orderbook: initialState.orderbook as UiSpotOrderbook | undefined
})

export type SpotStoreState = ReturnType<typeof state>

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
      new BigNumberInBase(trade.price).toWei(
        state.market.baseToken.decimals - state.market.quoteToken.decimals
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

    const [trade, secondLastTrade] = state.trades

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(trade.price)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.price)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  }
})

export const mutations = {
  setMarket(state: SpotStoreState, market: UiSpotMarket) {
    state.market = market
  },

  setMarketSummary(state: SpotStoreState, marketSummary: UiSpotMarketSummary) {
    state.marketSummary = marketSummary
  },

  resetMarket(state: SpotStoreState) {
    const initialState = initialStateFactory()

    state.market = initialState.market
    state.marketSummary = initialState.marketSummary
    state.orderbook = initialState.orderbook
    state.trades = initialState.trades
    state.subaccountOrders = initialState.subaccountOrders
    state.subaccountTrades = initialState.subaccountTrades
  },

  setMarkets(state: SpotStoreState, markets: UiSpotMarket[]) {
    state.markets = markets
  },

  setMarketsSummary(
    state: SpotStoreState,
    marketsSummary: UiSpotMarketSummary[]
  ) {
    state.marketsSummary = marketsSummary
  },

  setTrades(state: SpotStoreState, trades: UiSpotTrade[]) {
    state.trades = trades
  },

  pushTrade(state: SpotStoreState, trade: UiSpotTrade) {
    state.trades = [trade, ...state.trades]
  },

  setSubaccountTrades(state: SpotStoreState, subaccountTrades: UiSpotTrade[]) {
    state.subaccountTrades = subaccountTrades
  },

  setSubaccountOrders(
    state: SpotStoreState,
    subaccountOrders: UiSpotLimitOrder[]
  ) {
    state.subaccountOrders = subaccountOrders
  },

  pushSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    state.subaccountOrders = [subaccountOrder, ...state.subaccountOrders]
  },

  updateSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const index = state.subaccountOrders.findIndex(
      (order) => order.orderHash === subaccountOrder.orderHash
    )

    if (index > 0) {
      state.subaccountOrders = [...state.subaccountOrders].splice(
        index,
        1,
        subaccountOrder
      )
    }
  },

  pushOrUpdateSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = [subaccountOrder, ...subaccountOrders]
  },

  deleteSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = subaccountOrders
  },

  pushSubaccountTrade(state: SpotStoreState, subaccountTrade: UiSpotTrade) {
    state.subaccountTrades = [subaccountTrade, ...state.subaccountTrades]
  },

  updateSubaccountTrade(state: SpotStoreState, subaccountTrade: UiSpotTrade) {
    const index = state.subaccountTrades.findIndex(
      (order) => order.orderHash === subaccountTrade.orderHash
    )

    if (index > 0) {
      state.subaccountTrades = [...state.subaccountTrades].splice(
        index,
        1,
        subaccountTrade
      )
    }
  },

  deleteSubaccountTrade(state: SpotStoreState, subaccountTrade: UiSpotTrade) {
    const subaccountTrades = [...state.subaccountTrades].filter(
      (order) => order.orderHash !== subaccountTrade.orderHash
    )

    state.subaccountTrades = subaccountTrades
  },

  setOrderbook(state: SpotStoreState, orderbook: UiSpotOrderbook) {
    state.orderbook = orderbook
  },

  resetSubaccount(state: SpotStoreState) {
    const initialState = initialStateFactory()

    state.subaccountTrades = initialState.subaccountTrades
    state.subaccountOrders = initialState.subaccountOrders
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('resetMarket')
      cancelMarketStreams()
    },

    async init({ commit }) {
      commit('setMarkets', await fetchMarkets())
      commit('setMarketsSummary', await fetchMarketsSummary())
    },

    async changeMarket({ commit }, market: UiSpotMarket | undefined) {
      if (!market) {
        throw new Error('Market not found')
      }

      commit('setMarket', market)
      commit('setOrderbook', await fetchMarketOrderbook(market.marketId))
      commit('setMarketSummary', await fetchMarketSummary(market.marketId))
      commit(
        'setTrades',
        await fetchMarketTrades({
          marketId: market.marketId
        })
      )

      await this.app.$accessor.spot.streamOrderbook()
      await this.app.$accessor.spot.streamTrades()
      await this.app.$accessor.spot.streamSubaccountTrades()
      await this.app.$accessor.spot.streamSubaccountOrders()
      await this.app.$accessor.spot.fetchSubaccountOrders()
      await this.app.$accessor.spot.fetchSubaccountTrades()
      await this.app.$accessor.account.streamSubaccountBalances()
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
        },
        onEndCallback: () => {
          this.app.$accessor.spot.streamOrderbook()
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
        },
        onEndCallback: () => {
          this.app.$accessor.spot.streamTrades()
        }
      })
    },

    streamSubaccountOrders({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountOrders({
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId,
        callback: ({ order }) => {
          if (!order) {
            return
          }

          switch (order.state) {
            case SpotOrderState.Booked:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case SpotOrderState.PartialFilled:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case SpotOrderState.Cancelled:
              commit('deleteSubaccountOrder', order)
              break
            case SpotOrderState.Filled:
              commit('deleteSubaccountOrder', order)
              break
          }
        },
        onEndCallback: () => {
          this.app.$accessor.spot.streamSubaccountOrders()
        }
      })
    },

    streamSubaccountTrades({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountTrades({
        marketId: market.marketId,
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
        },
        onEndCallback: () => {
          this.app.$accessor.spot.streamSubaccountTrades()
        }
      })
    },

    async fetchSubaccountOrders({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountOrders',
        await fetchMarketOrders({
          marketId: market.marketId,
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountTrades({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const trades = await fetchMarketTrades({
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountTrades', trades)
    },

    async fetchMarketsSummary({ state, commit }) {
      const { marketsSummary, market } = state

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary = await fetchMarketsSummary(marketsSummary)

      if (market) {
        const updatedMarketSummary = updatedMarketsSummary.find(
          (m) => m.marketId === market.marketId
        )

        if (updatedMarketSummary) {
          commit('setMarketSummary', updatedMarketSummary)
        }
      }

      commit('setMarketsSummary', updatedMarketsSummary)
    },

    async fetchSubaccountMarketTrades({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      commit(
        'setSubaccountTrades',
        await fetchMarketTrades({
          marketId: market.marketId,
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async cancelOrder(_, order: UiSpotLimitOrder) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
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

      await cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId
      })
    },

    async batchCancelOrder(_, orders: UiSpotLimitOrder[]) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
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

      await batchCancelOrders({
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
        quantity,
        orderType
      }: {
        price: BigNumberInBase
        quantity: BigNumberInBase
        orderType: SpotOrderSide
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
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

      await submitLimitOrder({
        price,
        quantity,
        orderType,
        injectiveAddress,
        address,
        market,
        subaccountId: subaccount.subaccountId
      })
    },

    async submitMarketOrder(
      _,
      {
        quantity,
        price,
        orderType
      }: {
        price: BigNumberInBase
        quantity: BigNumberInBase
        orderType: SpotOrderSide
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
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

      await submitMarketOrder({
        quantity,
        orderType,
        price,
        injectiveAddress,
        address,
        market,
        subaccountId: subaccount.subaccountId
      })
    }
  }
)
