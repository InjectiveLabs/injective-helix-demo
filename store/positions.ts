import { actionTree } from 'typed-vuex'
import {
  BigNumberInBase,
  BigNumberInWei,
  derivativePriceToChainPrice,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UiDerivativeOrderbook, UiPosition } from '@injectivelabs/ui-common'
import { DerivativeOrderSide } from '@injectivelabs/derivatives-consumer'
import { FEE_RECIPIENT } from '~/app/utils/constants'
import {
  derivativeActionServiceFactory,
  derivativeService
} from '~/app/Services'

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

    async fetchOrderbook({ commit }) {
      const { markets } = this.app.$accessor.derivatives
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const marketOrderbooks = await Promise.all(
        markets.map(async ({ marketId }) => [
          marketId,
          await derivativeService.fetchOrderbook(marketId)
        ])
      )

      commit('setOrderbooks', Object.fromEntries(marketOrderbooks))
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

    async closeAllPosition(
      _,
      {
        positions
      }: {
        positions: UiPosition[]
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { markets } = this.app.$accessor.derivatives
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const derivativeActionService = derivativeActionServiceFactory()

      if (!isUserWalletConnected || !subaccount || positions.length === 0) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const formmatedPositions = positions
        .map((position) => {
          const market = markets.find((m) => m.marketId === position.marketId)

          if (market) {
            const orderType =
              position.direction === TradeDirection.Long
                ? DerivativeOrderSide.Sell
                : DerivativeOrderSide.Buy
            const liquidationPrice = new BigNumberInWei(
              position.liquidationPrice
            )
            const minTickPrice = derivativePriceToChainPrice({
              value: new BigNumberInBase(1).shiftedBy(-market.priceDecimals),
              quoteDecimals: market.quoteToken.decimals
            })
            const actualLiquidationPrice = liquidationPrice.lte(0)
              ? minTickPrice
              : liquidationPrice

            return {
              orderType,
              marketId: market.marketId,
              price: actualLiquidationPrice.toFixed(),
              quantity: derivativeQuantityToChainQuantityToFixed({
                value: position.quantity
              })
            }
          }

          return undefined
        })
        .filter((p) => p !== undefined) as {
        orderType: DerivativeOrderSide
        marketId: string
        price: string
        quantity: string
      }[]

      await derivativeActionService.closeAllPosition({
        address,
        injectiveAddress,
        positions: formmatedPositions,
        feeRecipient: FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })
    }
  }
)
