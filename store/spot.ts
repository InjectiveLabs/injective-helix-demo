import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { BigNumberInBase } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import { SpotOrderState } from '@injectivelabs/spot-consumer'
import {
  UiSpotOrderbook,
  UiSpotLimitOrder,
  UiSpotTrade,
  UiSpotMarket,
  SpotOrderType
} from '~/types'
import {
  fetchMarketOrderbook,
  fetchMarketOrders,
  fetchMarkets,
  fetchMarketTrades,
  submitLimitOrder,
  submitMarketOrder,
  cancelOrder,
  streamOrderbook,
  cancelMarketStreams,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountTrades
} from '~/app/services/spot'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  markets: [] as UiSpotMarket[],
  market: undefined as UiSpotMarket | undefined,
  orderbook: undefined as UiSpotOrderbook | undefined,
  trades: [] as UiSpotTrade[],
  subaccountTrades: [] as UiSpotTrade[],
  subaccountOrders: [] as UiSpotLimitOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiSpotMarket[],
  market: initialState.market as UiSpotMarket | undefined,
  trades: initialState.trades as UiSpotTrade[],
  subaccountTrades: initialState.subaccountTrades as UiSpotTrade[],
  subaccountOrders: initialState.subaccountOrders as UiSpotLimitOrder[],
  orderbook: initialState.orderbook as UiSpotOrderbook | undefined
})

export type SpotStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  marketSelected: (state) => {
    return !!state.market
  }
})

export const mutations = {
  setMarket(state: SpotStoreState, market: UiSpotMarket) {
    state.market = market
  },

  resetMarket(state: SpotStoreState) {
    const initialState = initialStateFactory()

    state.market = initialState.market
    state.orderbook = initialState.orderbook
    state.trades = initialState.trades
    state.subaccountOrders = initialState.subaccountOrders
    state.subaccountTrades = initialState.subaccountTrades
  },

  setMarkets(state: SpotStoreState, markets: UiSpotMarket[]) {
    state.markets = markets
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
    const index = state.subaccountOrders.findIndex(
      (order) => order.orderHash === subaccountOrder.orderHash
    )

    if (index > 0) {
      state.subaccountOrders = [...state.subaccountOrders].splice(index, 1)
    }
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
    const index = state.subaccountTrades.findIndex(
      (order) => order.orderHash === subaccountTrade.orderHash
    )

    if (index > 0) {
      state.subaccountTrades = [...state.subaccountTrades].splice(index, 1)
    }
  },

  setOrderbook(state: SpotStoreState, orderbook: UiSpotOrderbook) {
    state.orderbook = orderbook
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
    },

    async changeMarket({ commit }, market: UiSpotMarket | undefined) {
      if (!market) {
        throw new Error('Market not found')
      }

      commit('setMarket', market)
      commit('setOrderbook', await fetchMarketOrderbook(market.marketId))
      commit(
        'setTrades',
        await fetchMarketTrades({
          marketId: market.marketId
        })
      )

      streamOrderbook(market.marketId, ({ orderbook }) => {
        if (!orderbook) {
          return
        }

        commit('setOrderbook', orderbook)
      })

      streamTrades(market.marketId, ({ trade, operation }) => {
        if (!trade) {
          return
        }

        switch (operation) {
          case StreamOperation.Insert:
            commit('pushTrade', trade)
        }
      })

      await this.app.$accessor.spot.setSubaccountStreams()
      await this.app.$accessor.spot.fetchSubaccountOrders()
      await this.app.$accessor.spot.fetchSubaccountTrades()
      await this.app.$accessor.account.streamSubaccountBalances()
    },

    setSubaccountStreams({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountOrders(
        market.marketId,
        subaccount.subaccountId,
        ({ order }) => {
          if (!order) {
            return
          }

          switch (order.state) {
            case SpotOrderState.Unfilled:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case SpotOrderState.Canceled:
              commit('deleteSubaccountOrder', order)
              break
            case SpotOrderState.Filled:
              commit('deleteSubaccountOrder', order)
              break
          }
        }
      )

      streamSubaccountTrades(
        market.marketId,
        subaccount.subaccountId,
        ({ trade, operation }) => {
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
      )
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

      if (
        !isUserWalletConnected ||
        !injectiveAddress ||
        !subaccount ||
        !market
      ) {
        return
      }

      await cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId
      })

      await backupPromiseCall(() =>
        this.app.$accessor.spot.fetchSubaccountOrders()
      )
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
        orderType: SpotOrderType
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (
        !isUserWalletConnected ||
        !injectiveAddress ||
        !subaccount ||
        !market
      ) {
        return
      }

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
        orderType: SpotOrderType
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (
        !isUserWalletConnected ||
        !injectiveAddress ||
        !subaccount ||
        !market
      ) {
        return
      }

      await submitMarketOrder({
        quantity,
        orderType,
        price,
        injectiveAddress,
        address,
        market,
        subaccountId: subaccount.subaccountId
      })
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
    }
  }
)
