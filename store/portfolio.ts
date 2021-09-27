import { actionTree, getterTree } from 'typed-vuex'
import { SpotOrderState } from '@injectivelabs/spot-consumer'
import { DerivativeOrderState } from '@injectivelabs/derivatives-consumer'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotLimitOrder, UiDerivativeLimitOrder, UiPosition } from '~/types'
import {
  cancelOrder,
  fetchSubaccountOrders,
  streamSubaccountSpotOrders,
  streamSubaccountDerivativeOrders,
  cancelPortfolioStreams,
  batchCancelOrders,
  streamSubaccountPositions,
  fetchSubaccountPositions
} from '~/app/services/portfolio'

const initialStateFactory = () => ({
  subaccountOrders: [] as Array<UiSpotLimitOrder | UiDerivativeLimitOrder>,
  subaccountPositions: [] as Array<UiPosition>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountOrders: initialState.subaccountOrders as Array<
    UiSpotLimitOrder | UiDerivativeLimitOrder
  >,
  subaccountPositions: initialState.subaccountPositions as Array<UiPosition>
})

export type PortfolioStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setSubaccountPositions(
    state: PortfolioStoreState,
    subaccountPositions: Array<UiPosition>
  ) {
    state.subaccountPositions = subaccountPositions
  },

  setSubaccountOrders(
    state: PortfolioStoreState,
    subaccountOrders: Array<UiSpotLimitOrder | UiDerivativeLimitOrder>
  ) {
    state.subaccountOrders = subaccountOrders
  },

  pushSubaccountOrder(
    state: PortfolioStoreState,
    subaccountOrder: UiSpotLimitOrder | UiDerivativeLimitOrder
  ) {
    state.subaccountOrders = [subaccountOrder, ...state.subaccountOrders]
  },

  updateSubaccountOrder(
    state: PortfolioStoreState,
    subaccountOrder: UiSpotLimitOrder | UiDerivativeLimitOrder
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
    state: PortfolioStoreState,
    subaccountOrder: UiSpotLimitOrder | UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = [subaccountOrder, ...subaccountOrders]
  },

  deleteSubaccountOrder(
    state: PortfolioStoreState,
    subaccountOrder: UiSpotLimitOrder | UiDerivativeLimitOrder
  ) {
    const subaccountOrders = [...state.subaccountOrders].filter(
      (order) => order.orderHash !== subaccountOrder.orderHash
    )

    state.subaccountOrders = subaccountOrders
  },

  resetSubaccount(state: PortfolioStoreState) {
    const initialState = initialStateFactory()

    state.subaccountOrders = initialState.subaccountOrders
    state.subaccountPositions = initialState.subaccountPositions
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('resetSubaccount')
      cancelPortfolioStreams()
    },

    async init(_) {
      await this.app.$accessor.portfolio.fetchSubaccountOrders()
      await this.app.$accessor.portfolio.fetchSubaccountPositions()
      await this.app.$accessor.portfolio.streamSubaccountOrders()
      await this.app.$accessor.portfolio.streamSubaccountPositions()
    },

    streamSubaccountOrders({ state, commit }) {
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
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case SpotOrderState.Unfilled:
              commit('pushOrUpdateSubaccountOrder', order)
              break
            case SpotOrderState.PartialFilled:
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
      })

      streamSubaccountDerivativeOrders({
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

    streamSubaccountPositions({ state, commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountPositions({
        subaccountId: subaccount.subaccountId,
        callback: ({ position }) => {
          console.log(position)
        }
      })
    },

    async fetchSubaccountOrders({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setSubaccountOrders',
        await fetchSubaccountOrders({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchSubaccountPositions({ state, commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const positions = await fetchSubaccountPositions({
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountPositions', positions)
    },

    async cancelOrder(_, order: UiSpotLimitOrder | UiDerivativeLimitOrder) {
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

      await cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        marketId: order.marketId,
        subaccountId: subaccount.subaccountId
      })
    },

    async batchCancelOrder(
      _,
      orders: Array<UiSpotLimitOrder | UiDerivativeLimitOrder>
    ) {
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

      await batchCancelOrders({
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
