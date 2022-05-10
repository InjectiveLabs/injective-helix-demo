import { actionTree, getterTree } from 'typed-vuex'
import {
  BigNumberInBase,
  spotPriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  Change,
  SpotTransformer,
  zeroSpotMarketSummary,
  ZERO_IN_BASE,
  UiSpotLimitOrder,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSpotTrade
} from '@injectivelabs/ui-common'
import { SpotOrderSide, SpotOrderState } from '@injectivelabs/spot-consumer'
import {
  streamOrderbook,
  streamTrades,
  streamSubaccountOrders,
  streamSubaccountTrades
} from '~/app/streams/spot'
import {
  FEE_RECIPIENT,
  ORDERBOOK_STREAMING_ENABLED
} from '~/app/utils/constants'
import { spotActionService, spotService, tokenService } from '~/app/Services'
import { spot as allowedSpotMarkets } from '~/routes.config'

const initialStateFactory = () => ({
  markets: [] as UiSpotMarketWithToken[],
  marketsSummary: [] as UiSpotMarketSummary[],
  market: undefined as UiSpotMarketWithToken | undefined,
  marketSummary: undefined as UiSpotMarketSummary | undefined,
  orderbook: undefined as UiSpotOrderbook | undefined,
  trades: [] as UiSpotTrade[],
  subaccountTrades: [] as UiSpotTrade[],
  subaccountOrders: [] as UiSpotLimitOrder[]
})

const initialState = initialStateFactory()

export const state = () => ({
  markets: initialState.markets as UiSpotMarketWithToken[],
  marketsSummary: initialState.marketsSummary as UiSpotMarketSummary[],
  market: initialState.market as UiSpotMarketWithToken | undefined,
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

    const [trade] = state.trades
    const [secondLastTrade] = state.trades.filter(
      (t) => !new BigNumberInBase(t.price).eq(trade.price)
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(trade.price)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.price)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  }
})

export const mutations = {
  setMarket(state: SpotStoreState, market: UiSpotMarketWithToken) {
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

  setMarkets(state: SpotStoreState, markets: UiSpotMarketWithToken[]) {
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
    if (subaccountOrder.orderHash) {
      state.subaccountOrders = state.subaccountOrders.map((order) => {
        return order.orderHash === subaccountOrder.orderHash
          ? subaccountOrder
          : order
      })
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
    if (subaccountTrade.orderHash) {
      state.subaccountTrades = state.subaccountTrades.map((order) => {
        return order.orderHash === subaccountTrade.orderHash
          ? subaccountTrade
          : order
      })
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
    async reset({ commit }) {
      commit('resetMarket')
      await this.app.$accessor.app.cancelAllStreams()
    },

    async init({ commit }) {
      const markets = await spotService.fetchMarkets()
      const marketsWithToken = await tokenService.getSpotMarketsWithToken(
        markets
      )
      const uiMarkets = SpotTransformer.spotMarketsToUiSpotMarkets(
        marketsWithToken
      )

      // Only include markets that we pre-defined to generate static routes for
      const uiMarketsWithToken = uiMarkets
        .filter((market) => {
          return allowedSpotMarkets.includes(market.slug)
        })
        .sort((a, b) => {
          return (
            allowedSpotMarkets.indexOf(a.slug) -
            allowedSpotMarkets.indexOf(b.slug)
          )
        })

      commit('setMarkets', uiMarketsWithToken)

      const marketsSummary = await spotService.fetchMarketsSummary()
      const marketSummaryNotExists =
        !marketsSummary || (marketsSummary && marketsSummary.length === 0)
      const actualMarketsSummary = marketSummaryNotExists
        ? markets.map((market) => zeroSpotMarketSummary(market.marketId))
        : marketsSummary

      commit('setMarketsSummary', actualMarketsSummary as UiSpotMarketSummary[])
    },

    async initMarket({ commit, state }, marketSlug: string) {
      const { markets } = state

      if (!markets.length) {
        await this.app.$accessor.spot.init()
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
        await spotService.fetchMarketSummary(market.marketId)
      )

      if (ORDERBOOK_STREAMING_ENABLED) {
        await this.app.$accessor.spot.streamOrderbook()
      }

      // TODO
      await this.app.$accessor.exchange.fetchFeeDiscountAccountInfo()
      await this.app.$accessor.exchange.fetchTradingRewardsCampaign()
    },

    async initMarketStreams({ state }) {
      const { market } = state

      if (!market) {
        return
      }

      await this.app.$accessor.spot.streamTrades()
      await this.app.$accessor.spot.streamSubaccountTrades()
      await this.app.$accessor.spot.streamSubaccountOrders()
      await this.app.$accessor.account.streamSubaccountBalances()
    },

    async pollOrderbook({ commit, state }) {
      const { market } = state

      if (!market) {
        return
      }

      commit('setOrderbook', await spotService.fetchOrderbook(market.marketId))
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
        await spotService.fetchOrders({
          subaccountId: subaccount.subaccountId
        })
      )
    },

    async fetchOrderbook({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      commit('setOrderbook', await spotService.fetchOrderbook(market.marketId))
    },

    async fetchTrades({ state, commit }) {
      const { market } = state

      if (!market) {
        return
      }

      commit(
        'setTrades',
        await spotService.fetchTrades({ marketId: market.marketId })
      )
    },

    async fetchSubaccountTrades({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const trades = await spotService.fetchTrades({
        subaccountId: subaccount.subaccountId
      })

      commit('setSubaccountTrades', trades)
    },

    async fetchMarketsSummary({ state, commit }) {
      const { marketsSummary, markets, market } = state

      if (marketsSummary.length === 0) {
        return
      }

      const updatedMarketsSummary = await spotService.fetchMarketsSummary()
      const combinedMarketsSummary = SpotTransformer.marketsSummaryComparisons(
        updatedMarketsSummary,
        state.marketsSummary
      )

      if (
        !combinedMarketsSummary ||
        (combinedMarketsSummary && combinedMarketsSummary.length === 0)
      ) {
        commit(
          'setMarketsSummary',
          markets.map((market) => zeroSpotMarketSummary(market.marketId))
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

    async cancelOrder(_, order: UiSpotLimitOrder) {
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

      await spotActionService.cancelOrder({
        injectiveAddress,
        address,
        orderHash: order.orderHash,
        marketId: order.marketId,
        subaccountId: subaccount.subaccountId
      })
    },

    async batchCancelOrder(_, orders: UiSpotLimitOrder[]) {
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
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await spotActionService.submitLimitOrder({
        address,
        orderType,
        injectiveAddress,
        price: spotPriceToChainPriceToFixed({
          value: price,
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: spotQuantityToChainQuantityToFixed({
          value: quantity,
          baseDecimals: market.baseToken.decimals
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
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      await spotActionService.submitMarketOrder({
        address,
        orderType,
        injectiveAddress,
        price: spotPriceToChainPriceToFixed({
          value: price,
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: spotQuantityToChainQuantityToFixed({
          value: quantity,
          baseDecimals: market.baseToken.decimals
        }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })
    }
  }
)
