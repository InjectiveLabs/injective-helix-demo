import { actionTree } from 'typed-vuex'
import {
  BigNumberInBase,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition
} from '@injectivelabs/ui-common'
import { DerivativeOrderSide } from '@injectivelabs/derivatives-consumer'
import { FEE_RECIPIENT } from '~/app/utils/constants'
import { derivativeActionService, derivativeService } from '~/app/Services'
import { streamSubaccountPositions } from '~/app/streams/derivatives'
import { getRoundedLiquidationPrice } from '~/app/services/derivatives'

const initialStateFactory = () => ({
  orderbooks: {} as Record<string, UiDerivativeOrderbook>,
  subaccountPositions: [] as UiPosition[]
})

const initialState = initialStateFactory()

export const state = () => ({
  orderbooks: initialState.orderbooks as Record<string, UiDerivativeOrderbook>,
  subaccountPositions: initialState.subaccountPositions as UiPosition[]
})

export type PositionStoreState = ReturnType<typeof state>

export const mutations = {
  setOrderbooks(
    state: PositionStoreState,
    orderbooks: Record<string, UiDerivativeOrderbook>
  ) {
    state.orderbooks = orderbooks
  },

  setSubaccountPositions(
    state: PositionStoreState,
    subaccountPositions: UiPosition[]
  ) {
    state.subaccountPositions = subaccountPositions
  },

  updateSubaccountPosition(
    state: PositionStoreState,
    subaccountPosition: UiPosition
  ) {
    const positionQuantity = new BigNumberInBase(subaccountPosition.quantity)
    const index = state.subaccountPositions.findIndex(
      (position) => position.marketId === subaccountPosition.marketId
    )

    if (index !== -1) {
      // Position has been closed
      if (positionQuantity.lte(0)) {
        state.subaccountPositions = [...state.subaccountPositions].filter(
          (position) => position.marketId !== subaccountPosition.marketId
        )
      } else {
        // Existing position has been updated
        state.subaccountPositions = state.subaccountPositions.map(
          (position) => {
            return position.marketId === subaccountPosition.marketId
              ? subaccountPosition
              : position
          }
        )
      }
    } else if (positionQuantity.gt(0)) {
      state.subaccountPositions = [
        subaccountPosition,
        ...state.subaccountPositions
      ]
    }
  },

  reset(state: PositionStoreState) {
    const initialState = initialStateFactory()

    state.orderbooks = initialState.orderbooks
    state.subaccountPositions = initialState.subaccountPositions
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    reset({ commit }) {
      commit('reset')
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

    // Fetching multiple market orderbooks for unrealized PnL calculation within
    async fetchMarketsOrderbook({ commit }) {
      const { markets } = this.app.$accessor.derivatives
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (markets.length === 0) {
        return
      }

      const marketsOrderbook = await derivativeService.fetchMarketsOrderbook(
        markets.map((market) => market.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, orderbook, index) => {
          return {
            ...marketOrderbooks,
            [markets[index].marketId]: orderbook
          }
        },
        {} as Record<string, UiDerivativeOrderbook>
      )

      commit('setOrderbooks', marketsOrderbookMap)
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within a market page
    async fetchOpenPositionsMarketsOrderbook({ state, commit }) {
      const { subaccountPositions } = state
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      if (subaccountPositions.length === 0) {
        return
      }

      const marketsOrderbook = await derivativeService.fetchMarketsOrderbook(
        subaccountPositions.map((position) => position.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, orderbook, index) => {
          return {
            ...marketOrderbooks,
            [subaccountPositions[index].marketId]: orderbook
          }
        },
        {} as Record<string, UiDerivativeOrderbook>
      )

      commit('setOrderbooks', marketsOrderbookMap)
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
            commit('updateSubaccountPosition', position)
          }
        }
      })
    },

    async closePosition(
      _,
      {
        market,
        position
      }: {
        market: UiDerivativeMarketWithToken
        position: UiPosition
      }
    ) {
      const { subaccount } = this.app.$accessor.account
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

      const orderType =
        position.direction === TradeDirection.Long
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy
      const liquidationPrice = getRoundedLiquidationPrice(position, market)

      await derivativeActionService.closePosition({
        address,
        orderType,
        injectiveAddress,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        }),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        marketId: position.marketId,
        subaccountId: subaccount.subaccountId
      })
    },

    async closeAllPosition(_, positions: UiPosition[]) {
      const { subaccount } = this.app.$accessor.account
      const { markets } = this.app.$accessor.derivatives
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral

      if (!isUserWalletConnected || !subaccount || positions.length === 0) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const formattedPositions = positions
        .map((position) => {
          const market = markets.find((m) => m.marketId === position.marketId)

          if (!market) {
            return undefined
          }

          const orderType =
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy
          const liquidationPrice = getRoundedLiquidationPrice(position, market)

          return {
            orderType,
            marketId: market.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          } as {
            orderType: DerivativeOrderSide
            marketId: string
            price: string
            quantity: string
          }
        })
        .filter((p) => p !== undefined) as []

      await derivativeActionService.closeAllPosition({
        address,
        injectiveAddress,
        triggerPrice: '0', // TODO
        positions: formattedPositions,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })

      await this.app.$accessor.positions.fetchSubaccountPositions()
    },

    async closePositionAndReduceOnlyOrders(
      _,
      {
        market,
        position
      }: {
        market?: UiDerivativeMarketWithToken
        position: UiPosition
        reduceOnlyOrders: UiDerivativeLimitOrder[]
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market: currentMarket } = this.app.$accessor.derivatives
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral

      const actualMarket = (currentMarket ||
        market) as UiDerivativeMarketWithToken

      if (
        !isUserWalletConnected ||
        !subaccount ||
        (!market && !currentMarket)
      ) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const orderType =
        position.direction === TradeDirection.Long
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy
      const liquidationPrice = getRoundedLiquidationPrice(
        position,
        actualMarket
      )

      await derivativeActionService.closePosition({
        address,
        orderType,
        injectiveAddress,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        }),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        marketId: actualMarket.marketId,
        subaccountId: subaccount.subaccountId
      })

      await this.app.$accessor.positions.fetchSubaccountPositions()
    },

    async addMarginToPosition(
      _,
      {
        market,
        amount
      }: {
        market: UiDerivativeMarketWithToken
        amount: BigNumberInBase
      }
    ) {
      const { subaccount } = this.app.$accessor.account
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

      await derivativeActionService.addMarginToPosition({
        address,
        injectiveAddress,
        amount: derivativeMarginToChainMarginToFixed({
          value: amount,
          quoteDecimals: market.quoteToken.decimals
        }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        srcSubaccountId: subaccount.subaccountId,
        dstSubaccountId: subaccount.subaccountId
      })
    }
  }
)
