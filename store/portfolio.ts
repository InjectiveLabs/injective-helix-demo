import { actionTree, getterTree } from 'typed-vuex'
import { SpotOrderState } from '@injectivelabs/spot-consumer'
import { DerivativeOrderState } from '@injectivelabs/derivatives-consumer'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotLimitOrder,
  UiDerivativeLimitOrder,
  UiPosition,
  UiDerivativeOrderbook
} from '~/types'
import {
  fetchSubaccountOrders,
  streamSubaccountSpotOrders,
  streamSubaccountDerivativeOrders,
  cancelPortfolioStreams,
  batchCancelOrders,
  streamSubaccountPositions,
  fetchSubaccountPositions,
  streamOrderbooks,
  fetchDerivativeOrderbooks,
  cancelPortfolioOrderbookStreams
} from '~/app/services/portfolio'

const initialStateFactory = () => ({
  subaccountOrders: [] as Array<UiSpotLimitOrder | UiDerivativeLimitOrder>,
  derivativeOrderbooks: {} as Record<string, UiDerivativeOrderbook>,
  subaccountPositions: [] as Array<UiPosition>
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountOrders: initialState.subaccountOrders as Array<
    UiSpotLimitOrder | UiDerivativeLimitOrder
  >,
  subaccountPositions: initialState.subaccountPositions as Array<UiPosition>,
  derivativeOrderbooks: {} as Record<string, UiDerivativeOrderbook>
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

  setDerivativeOrderbooks(
    state: PortfolioStoreState,
    derivativeOrderbooks: Record<string, UiDerivativeOrderbook>
  ) {
    state.derivativeOrderbooks = derivativeOrderbooks
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

  pushOrUpdateSubaccountPosition(
    state: PortfolioStoreState,
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

  pushOrUpdateOrderbook(
    state: PortfolioStoreState,
    {
      orderbook,
      marketId
    }: { orderbook: UiDerivativeOrderbook; marketId: string }
  ) {
    state.derivativeOrderbooks = {
      ...state.derivativeOrderbooks,
      [marketId]: orderbook
    }
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
    state.derivativeOrderbooks = initialState.derivativeOrderbooks
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
      await this.app.$accessor.portfolio.streamSubaccountPositions()
      await this.app.$accessor.portfolio.fetchDerivativeOrderbooks()
      await this.app.$accessor.portfolio.streamOrderbooks()
      await this.app.$accessor.portfolio.streamSubaccountOrders()
      await this.app.$accessor.token.getAllTokenWithBalanceAndAllowance()
      await this.app.$accessor.bank.fetchBalances()
      await this.app.$accessor.account.fetchAccountPortfolio()
    },

    async poll(_) {
      await this.app.$accessor.account.fetchAccountPortfolio()
    },

    streamSubaccountOrders({ commit }) {
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
      const { subaccountPositions } = state
      const oldSubaccountPositions = [...subaccountPositions]

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      streamSubaccountPositions({
        subaccountId: subaccount.subaccountId,
        callback: ({ position }) => {
          if (position) {
            commit('pushOrUpdateSubaccountPosition', position)

            /**
             * If a new position was streamed, setup streaming
             * for the orderbook of the position's marketId as well
             */
            const positionExists = oldSubaccountPositions.find(
              (p) => p.marketId === position.marketId
            )
            if (!positionExists) {
              this.app.$accessor.portfolio.streamOrderbooks()
            }
          }
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

    async fetchDerivativeOrderbooks({ state, commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet
      const { subaccountPositions } = state

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      commit(
        'setDerivativeOrderbooks',
        await fetchDerivativeOrderbooks(
          subaccountPositions.map((position) => position.marketId)
        )
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

    streamOrderbooks({ commit, state }) {
      const { subaccountPositions } = state

      if (!subaccountPositions.length) {
        return
      }

      /**
       * Cancel in case there is existing stream,
       * We do this if there is a new position open
       * and we need to setup a stream for that position's marketId
       */
      cancelPortfolioOrderbookStreams()

      streamOrderbooks({
        marketIds: subaccountPositions.map((position) => position.marketId),
        callback: ({ orderbook, marketId }) => {
          if (orderbook) {
            commit('pushOrUpdateOrderbook', { orderbook, marketId })
          }
        }
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
