import { actionTree, getterTree } from 'typed-vuex'
import { SpotOrderState } from '@injectivelabs/spot-consumer'
import { BigNumberInBase } from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  UiSpotLimitOrder,
  UiSpotTrade,
  UiDerivativeLimitOrder,
  UiDerivativeTrade,
  UiPosition
} from '@injectivelabs/ui-common'
import { DerivativeOrderState } from '@injectivelabs/derivatives-consumer'
import {
  streamSubaccountOrders as streamSubaccountDerivativeOrders,
  streamSubaccountTrades as streamSubaccountDerivativeTrades,
  streamSubaccountPositions
} from '~/app/streams/derivatives'
import {
  streamSubaccountOrders as streamSubaccountSpotOrders,
  streamSubaccountTrades as streamSubaccountSpotTrades
} from '~/app/streams/spot'
import {
  derivativeActionServiceFactory,
  derivativeService,
  spotActionServiceFactory,
  spotService
} from '~/app/Services'

const initialStateFactory = () => ({
  subaccountSpotOrders: [] as Array<UiSpotLimitOrder>,
  subaccountDerivativeOrders: [] as Array<UiDerivativeLimitOrder>,
  subaccountSpotTrades: [] as Array<UiSpotTrade>,
  subaccountDerivativeTrades: [] as Array<UiDerivativeTrade>,
  subaccountPositions: [] as Array<UiPosition>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountSpotOrders: initialState.subaccountSpotOrders as Array<UiSpotLimitOrder>,
  subaccountDerivativeOrders: initialState.subaccountDerivativeOrders as Array<UiDerivativeLimitOrder>,
  subaccountSpotTrades: initialState.subaccountSpotTrades as Array<UiSpotTrade>,
  subaccountDerivativeTrades: initialState.subaccountDerivativeTrades as Array<UiDerivativeTrade>,
  subaccountPositions: initialState.subaccountPositions as Array<UiPosition>
})

export type ActivitiesStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubaccountPositions(
    state: ActivitiesStoreState,
    subaccountPositions: Array<UiPosition>
  ) {
    state.subaccountPositions = subaccountPositions
  },

  setSubaccountSpotTrades(
    state: ActivitiesStoreState,
    trades: Array<UiSpotTrade>
  ) {
    state.subaccountSpotTrades = trades
  },

  setSubaccountDerivativeTrades(
    state: ActivitiesStoreState,
    trades: Array<UiDerivativeTrade>
  ) {
    state.subaccountDerivativeTrades = trades
  },

  pushDerivativeTrade(state: ActivitiesStoreState, trade: UiDerivativeTrade) {
    state.subaccountDerivativeTrades = [
      trade,
      ...state.subaccountDerivativeTrades
    ]
  },

  pushSpotTrade(state: ActivitiesStoreState, trade: UiSpotTrade) {
    state.subaccountSpotTrades = [trade, ...state.subaccountSpotTrades]
  },

  setSubaccountSpotOrders(
    state: ActivitiesStoreState,
    subaccountOrders: Array<UiSpotLimitOrder>
  ) {
    state.subaccountSpotOrders = subaccountOrders
  },

  setSubaccountDerivativeOrders(
    state: ActivitiesStoreState,
    subaccountOrders: Array<UiDerivativeLimitOrder>
  ) {
    state.subaccountDerivativeOrders = subaccountOrders
  },

  pushSubaccountSpotOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    state.subaccountSpotOrders = [
      subaccountOrder,
      ...state.subaccountSpotOrders
    ]
  },

  pushSubaccountDerivativeOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    state.subaccountDerivativeOrders = [
      subaccountOrder,
      ...state.subaccountDerivativeOrders
    ]
  },

  updateSubaccountSpotOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const index = state.subaccountSpotOrders.findIndex(
      (order) => order.orderHash === subaccountOrder.orderHash
    )

    if (index > 0) {
      state.subaccountSpotOrders = [...state.subaccountSpotOrders].splice(
        index,
        1,
        subaccountOrder
      )
    }
  },

  updateSubaccountDerivativeOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    const index = state.subaccountDerivativeOrders.findIndex(
      (order) => order.orderHash === subaccountOrder.orderHash
    )

    if (index > 0) {
      state.subaccountDerivativeOrders = [
        ...state.subaccountDerivativeOrders
      ].splice(index, 1, subaccountOrder)
    }
  },

  pushOrUpdateSubaccountSpotOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountSpotOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountSpotOrders = [subaccountOrder, ...subaccountOrders]
  },

  pushOrUpdateSubaccountDerivativeOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountDerivativeOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountDerivativeOrders = [subaccountOrder, ...subaccountOrders]
  },

  pushOrUpdateSubaccountPosition(
    state: ActivitiesStoreState,
    subaccountPosition: UiPosition
  ) {
    const subaccountPositions = [...state.subaccountPositions].filter(
      (position) => position.marketId !== subaccountPosition.marketId
    )

    const updatedSubaccountPositions = [
      subaccountPosition,
      ...subaccountPositions
    ]
    const filteredNonZeroQuantityPositions = updatedSubaccountPositions.filter(
      (position) => new BigNumberInBase(position.quantity).gt(0)
    )
    state.subaccountPositions = filteredNonZeroQuantityPositions
  },

  deleteSubaccountSpotOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiSpotLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountSpotOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountSpotOrders = subaccountOrders
  },

  deleteSubaccountDerivativeOrder(
    state: ActivitiesStoreState,
    subaccountOrder: UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountDerivativeOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountDerivativeOrders = subaccountOrders
  },

  resetSpotSubaccount(state: ActivitiesStoreState) {
    const initialState = initialStateFactory()

    state.subaccountSpotOrders = initialState.subaccountSpotOrders
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    streamSubaccountSpotOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountSpotOrders({
        subaccountId: subaccount.subaccountId,
        callback: ({ order }) => {
          if (!order) {
            return
          }

          switch (order.state) {
            case SpotOrderState.Booked:
              commit('pushOrUpdateSubaccountSpotOrder', order)
              break
            case SpotOrderState.Unfilled:
              commit('pushOrUpdateSubaccountSpotOrder', order)
              break
            case SpotOrderState.PartialFilled:
              commit('pushOrUpdateSubaccountSpotOrder', order)
              break
            case SpotOrderState.Canceled:
              commit('deleteSubaccountSpotOrder', order)
              break
            case SpotOrderState.Filled:
              commit('deleteSubaccountSpotOrder', order)
              break
          }
        }
      })
    },

    streamSubaccountDerivativeOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountDerivativeOrders({
        subaccountId: subaccount.subaccountId,
        callback: ({ order }) => {
          if (!order) {
            return
          }

          switch (order.state) {
            case DerivativeOrderState.Booked:
              commit('pushOrUpdateSubaccountDerivativeOrder', order)
              break
            case DerivativeOrderState.Unfilled:
              commit('pushOrUpdateSubaccountDerivativeOrder', order)
              break
            case DerivativeOrderState.PartialFilled:
              commit('pushOrUpdateSubaccountDerivativeOrder', order)
              break
            case DerivativeOrderState.Canceled:
              commit('deleteSubaccountDerivativeOrder', order)
              break
            case DerivativeOrderState.Filled:
              commit('deleteSubaccountDerivativeOrder', order)
              break
          }
        }
      })
    },

    streamSubaccountDerivativeTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountDerivativeTrades({
        subaccountId: subaccount.subaccountId,
        callback: ({ trade, operation }) => {
          if (!trade) {
            return
          }

          switch (operation) {
            case StreamOperation.Insert:
              commit('pushDerivativeTrade', trade)
          }
        }
      })
    },

    streamSubaccountSpotTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountSpotTrades({
        subaccountId: subaccount.subaccountId,
        callback: ({ trade, operation }) => {
          if (!trade) {
            return
          }

          switch (operation) {
            case StreamOperation.Insert:
              commit('pushSpotTrade', trade)
          }
        }
      })
    },

    streamSubaccountPositions({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountPositions({
        subaccountId: subaccount.subaccountId,
        callback: ({ position }) => {
          if (position) {
            commit('pushOrUpdateSubaccountPosition', position)
          }
        }
      })
    },

    async fetchSubaccountSpotTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountSpotTrades',
        await spotService.fetchTrades({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountDerivativeTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountDerivativeTrades',
        await derivativeService.fetchTrades({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountSpotOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountSpotOrders',
        await spotService.fetchOrders({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountDerivativeOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountDerivativeOrders',
        await derivativeService.fetchOrders({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountPositions({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const positions = await derivativeService.fetchPositions({
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountPositions', positions)
    },

    async batchCancelSpotOrders(_, orders: UiSpotLimitOrder[]) {
      const { subaccount } = this.app.$accessor.account
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const spotActionService = spotActionServiceFactory()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await spotActionService.batchCancelOrders({
        injectiveAddress,
        address,
        orders: orders.map((o) => ({
          orderHash: o.orderHash,
          subaccountId: o.subaccountId,
          marketId: o.marketId
        }))
      })
    },

    async batchCancelDerivativeOrders(_, orders: UiDerivativeLimitOrder[]) {
      const { subaccount } = this.app.$accessor.account
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const derivativeActionService = derivativeActionServiceFactory()

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
    }
  }
)
