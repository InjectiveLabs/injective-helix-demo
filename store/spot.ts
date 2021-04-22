import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { BigNumberInBase } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/spot-consumer'
import {
  UiOrderbook,
  UiSpotMarketOrder,
  UiSpotMarketTrade,
  UiSpotMarket,
  SpotOrderType
} from '~/types'
import {
  fetchSpotMarketOrderbook,
  fetchSpotMarketOrders,
  fetchSpotMarkets,
  fetchSpotMarketTrades,
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
  orderbook: undefined as UiOrderbook | undefined,
  trades: [] as UiSpotMarketTrade[],
  subaccountTrades: [] as UiSpotMarketTrade[],
  subaccountOrders: [] as UiSpotMarketOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiSpotMarket[],
  market: initialState.market as UiSpotMarket | undefined,
  trades: initialState.trades as UiSpotMarketTrade[],
  subaccountTrades: initialState.subaccountTrades as UiSpotMarketTrade[],
  subaccountOrders: initialState.subaccountOrders as UiSpotMarketOrder[],
  orderbook: initialState.orderbook as UiOrderbook | undefined
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

  setTrades(state: SpotStoreState, trades: UiSpotMarketTrade[]) {
    state.trades = trades
  },

  pushTrade(state: SpotStoreState, trade: UiSpotMarketTrade) {
    state.trades = [trade, ...state.trades]
  },

  setSubaccountTrades(
    state: SpotStoreState,
    subaccountTrades: UiSpotMarketTrade[]
  ) {
    state.subaccountTrades = subaccountTrades
  },

  setSubaccountOrders(
    state: SpotStoreState,
    subaccountOrders: UiSpotMarketOrder[]
  ) {
    state.subaccountOrders = subaccountOrders
  },

  pushSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotMarketOrder
  ) {
    state.subaccountOrders = [subaccountOrder, ...state.subaccountOrders]
  },

  updateSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotMarketOrder
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

  deleteSubaccountOrder(
    state: SpotStoreState,
    subaccountOrder: UiSpotMarketOrder
  ) {
    const index = state.subaccountOrders.findIndex(
      (order) => order.orderHash === subaccountOrder.orderHash
    )

    if (index > 0) {
      state.subaccountOrders = [...state.subaccountOrders].splice(index, 1)
    }
  },

  pushSubaccountTrade(
    state: SpotStoreState,
    subaccountTrade: UiSpotMarketTrade
  ) {
    state.subaccountTrades = [subaccountTrade, ...state.subaccountTrades]
  },

  updateSubaccountTrade(
    state: SpotStoreState,
    subaccountTrade: UiSpotMarketTrade
  ) {
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

  deleteSubaccountTrade(
    state: SpotStoreState,
    subaccountTrade: UiSpotMarketTrade
  ) {
    const index = state.subaccountTrades.findIndex(
      (order) => order.orderHash === subaccountTrade.orderHash
    )

    if (index > 0) {
      state.subaccountTrades = [...state.subaccountTrades].splice(index, 1)
    }
  },

  setOrderbook(state: SpotStoreState, orderbook: UiOrderbook) {
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
      commit('setMarkets', await fetchSpotMarkets())
    },

    async changeMarket({ commit, dispatch }, market: UiSpotMarket | undefined) {
      if (!market) {
        throw new Error('Market not found')
      }

      commit('setMarket', market)
      commit('setOrderbook', await fetchSpotMarketOrderbook(market.marketId))
      commit(
        'setTrades',
        await fetchSpotMarketTrades({
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

      await dispatch('setSubaccountStreams')
      await dispatch('fetchSubaccountOrders')
      await dispatch('fetchSubaccountTrades')
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
        ({ order, operation }) => {
          if (!order) {
            return
          }

          switch (operation) {
            case StreamOperation.Insert:
              commit('pushSubaccountOrder', order)
              break
            case StreamOperation.Delete:
              commit('deleteSubaccountOrder', order)
              break
            case StreamOperation.Update:
              commit('updateSubaccountOrder', order)
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
        await fetchSpotMarketOrders({
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
        await fetchSpotMarketTrades({
          marketId: market.marketId,
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async cancelOrder({ dispatch }, order: UiSpotMarketOrder) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.spot
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !injectiveAddress) {
        throw new Error('Please connect your wallet')
      }

      if (!subaccount) {
        throw new Error('Subaccount not found')
      }

      if (!market) {
        throw new Error('Market not found')
      }

      await cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        orderType: order.orderType,
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId
      })

      await backupPromiseCall(() => dispatch('fetchSubaccountOrders'))
    },

    async submitLimitOrder(
      { dispatch },
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

      if (!isUserWalletConnected || !injectiveAddress) {
        throw new Error('Please connect your wallet')
      }

      if (!subaccount) {
        throw new Error('Subaccount not found')
      }

      if (!market) {
        throw new Error('Market not found')
      }

      await submitLimitOrder({
        price,
        quantity,
        orderType,
        injectiveAddress,
        address,
        subaccountId: subaccount.subaccountId,
        marketId: market.marketId
      })

      await backupPromiseCall(() => dispatch('fetchSubaccountOrders'))
    },

    async submitMarketOrder(
      { dispatch },
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

      if (!isUserWalletConnected || !injectiveAddress) {
        throw new Error('Please connect your wallet')
      }

      if (!subaccount) {
        throw new Error('Subaccount not found')
      }

      if (!market) {
        throw new Error('Market not found')
      }

      await submitMarketOrder({
        quantity,
        orderType,
        price,
        injectiveAddress,
        address,
        subaccountId: subaccount.subaccountId,
        marketId: market.marketId
      })

      await backupPromiseCall(() => dispatch('fetchSubaccountOrders'))
      await backupPromiseCall(() => dispatch('fetchSubaccountTrades'))
    },

    async fetchSubaccountMarketTrades({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected) {
        throw new Error('Please connect your wallet')
      }

      if (!subaccount) {
        throw new Error('Subaccount not found')
      }

      if (!market) {
        throw new Error('Market not found')
      }

      commit(
        'setSubaccountTrades',
        await fetchSpotMarketTrades({
          marketId: market.marketId,
          subaccountId: subaccount.subaccountId
        })
      )
    }
  }
)
