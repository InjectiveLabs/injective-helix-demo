import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { BigNumberInWei } from '@injectivelabs/utils'
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
  cancelOrder
} from '~/app/services/spot'

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

  setOrderbook(state: SpotStoreState, orderbook: UiOrderbook) {
    state.orderbook = orderbook
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init({ commit }) {
      commit('setMarkets', await fetchSpotMarkets())
    },

    async changeMarket({ commit }, market: UiSpotMarket | undefined) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

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

      if (isUserWalletConnected && subaccount) {
        commit(
          'setSubaccountTrades',
          await fetchSpotMarketTrades({
            marketId: market.marketId,
            subaccountId: subaccount.subaccountId
          })
        )
        commit(
          'setSubaccountOrders',
          await fetchSpotMarketOrders({
            marketId: market.marketId,
            subaccountId: subaccount.subaccountId
          })
        )
      }
    },

    async cancelOrder(_, order: UiSpotMarketOrder) {
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
    },

    async submitLimitOrder(
      _,
      {
        price,
        quantity,
        orderType
      }: {
        price: BigNumberInWei
        quantity: BigNumberInWei
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
    },

    async submitMarketOrder(
      _,
      {
        quantity,
        price,
        orderType
      }: {
        price: BigNumberInWei
        quantity: BigNumberInWei
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
