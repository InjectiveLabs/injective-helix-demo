import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { BigNumberInBase } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import { DerivativeOrderState } from '@injectivelabs/derivatives-consumer'
import {
  UiDerivativeOrderbook,
  UiDerivativeLimitOrder,
  UiDerivativeTrade,
  UiDerivativeMarket,
  DerivativeOrderType,
  UiPosition
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
  streamSubaccountTrades,
  fetchMarketPositions,
  streamSubaccountPositions,
  closePosition
} from '~/app/services/derivatives'

const initialStateFactory = () => ({
  markets: [] as UiDerivativeMarket[],
  market: undefined as UiDerivativeMarket | undefined,
  orderbook: undefined as UiDerivativeOrderbook | undefined,
  trades: [] as UiDerivativeTrade[],
  subaccountPosition: undefined as UiPosition | undefined,
  subaccountTrades: [] as UiDerivativeTrade[],
  subaccountOrders: [] as UiDerivativeLimitOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiDerivativeMarket[],
  market: initialState.market as UiDerivativeMarket | undefined,
  trades: initialState.trades as UiDerivativeTrade[],
  subaccountTrades: initialState.subaccountTrades as UiDerivativeTrade[],
  subaccountPosition: initialState.subaccountPosition as UiPosition | undefined,
  subaccountOrders: initialState.subaccountOrders as UiDerivativeLimitOrder[],
  orderbook: initialState.orderbook as UiDerivativeOrderbook | undefined
})

export type DerivativeStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  marketSelected: (state) => {
    return !!state.market
  }
})

export const mutations = {
  setMarket(state: DerivativeStoreState, market: UiDerivativeMarket) {
    state.market = market
  },

  resetMarket(state: DerivativeStoreState) {
    const initialState = initialStateFactory()

    state.market = initialState.market
    state.orderbook = initialState.orderbook
    state.trades = initialState.trades
    state.subaccountOrders = initialState.subaccountOrders
    state.subaccountTrades = initialState.subaccountTrades
  },

  setMarkets(state: DerivativeStoreState, markets: UiDerivativeMarket[]) {
    state.markets = markets
  },

  setTrades(state: DerivativeStoreState, trades: UiDerivativeTrade[]) {
    state.trades = trades
  },

  pushTrade(state: DerivativeStoreState, trade: UiDerivativeTrade) {
    state.trades = [trade, ...state.trades]
  },

  setSubaccountPosition(
    state: DerivativeStoreState,
    subaccountPosition: UiPosition
  ) {
    state.subaccountPosition = subaccountPosition
  },

  deleteSubaccountPosition(state: DerivativeStoreState) {
    state.subaccountPosition = undefined
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
    reset({ commit }) {
      commit('resetMarket')
      cancelMarketStreams()
    },

    async init({ commit }) {
      commit('setMarkets', await fetchMarkets())
    },

    async changeMarket({ commit }, market: UiDerivativeMarket | undefined) {
      if (!market) {
        throw new Error('Market not found')
      }

      commit('setMarket', market)
      commit('setOrderbook', await fetchMarketOrderbook(market.marketId))

      const trades = await fetchMarketTrades({
        marketId: market.marketId
      })
      commit('setTrades', trades.reverse())

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

      await this.app.$accessor.derivatives.setSubaccountStreams()
      await this.app.$accessor.derivatives.fetchSubaccountOrders()
      await this.app.$accessor.derivatives.fetchSubaccountTrades()
      await this.app.$accessor.derivatives.fetchSubaccountPosition()
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
            case DerivativeOrderState.Unfilled:
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
      )

      streamSubaccountPositions(
        market.marketId,
        subaccount.subaccountId,
        ({ position }) => {
          if (!position) {
            return
          }

          const quantity = new BigNumberInBase(position.quantity)

          if (quantity.lte(0)) {
            commit('deleteSubaccountPosition')
          } else {
            commit('setSubaccountPosition', position)
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

    async fetchSubaccountPosition({ state, commit }) {
      const { market } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!market) {
        return
      }

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const [position] = await fetchMarketPositions({
        marketId: market.marketId,
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountPosition', position)
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

      commit('setSubaccountTrades', trades.reverse())
    },

    async cancelOrder(_, order: UiDerivativeLimitOrder) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
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
    },

    async submitLimitOrder(
      _,
      {
        price,
        margin,
        quantity,
        orderType
      }: {
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderType
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
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
        margin,
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
        margin,
        orderType
      }: {
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderType
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
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
        margin,
        orderType,
        price,
        injectiveAddress,
        address,
        market,
        subaccountId: subaccount.subaccountId
      })
    },

    async closePosition(
      _,
      {
        quantity,
        price,
        orderType
      }: {
        price: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderType
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
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

      await closePosition({
        quantity,
        price,
        injectiveAddress,
        address,
        market,
        orderType,
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
