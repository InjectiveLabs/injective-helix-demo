import { actionTree } from 'typed-vuex'
import {
  BigNumberInBase,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  DerivativeOrderSide,
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeMarketOrder,
  MsgIncreasePositionMargin
  // MsgBatchUpdateOrders
} from '@injectivelabs/sdk-ts'
import {
  derivativeOrderTypeToGrpcOrderType,
  DerivativesMetrics,
  MarketType,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import { FEE_RECIPIENT } from '~/app/utils/constants'
import { streamSubaccountPositions } from '~/app/client/streams/derivatives'
import { getRoundedLiquidationPrice } from '~/app/client/utils/derivatives'
import { binaryOptions, derivatives } from '~/routes.config'
import { exchangeDerivativesApi, msgBroadcastClient } from '~/app/Services'

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

      const positions = await exchangeDerivativesApi.fetchPositions({
        subaccountId: subaccount.subaccountId
      })

      const positionWithActiveMarket = positions.filter((p) => {
        const tickerFormattedToSlug = p.ticker
          .replaceAll('/', '-')
          .replaceAll(' ', '-')
          .toLowerCase()

        return [...derivatives, ...binaryOptions].includes(
          tickerFormattedToSlug
        )
      })

      commit('setSubaccountPositions', positionWithActiveMarket)
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

      const marketsOrderbook = await exchangeDerivativesApi.fetchOrderbooks(
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

      const marketsOrderbook = await exchangeDerivativesApi.fetchOrderbooks(
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
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet
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

      const messageType =
        market && market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        margin: '0',
        triggerPrice: '0',
        marketId: position.marketId,
        subaccountId: subaccount.subaccountId,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        })
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateMarketOrder
      })
    },

    async closeAllPosition(_, positions: UiPosition[]) {
      const { subaccount } = this.app.$accessor.account
      const { markets } = this.app.$accessor.derivatives
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet
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

          const messageType =
            market && market.subType === MarketType.BinaryOptions
              ? MsgCreateBinaryOptionsMarketOrder
              : MsgCreateDerivativeMarketOrder
          const orderType =
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy
          const liquidationPrice = getRoundedLiquidationPrice(position, market)

          return {
            orderType,
            messageType,
            marketId: market.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          } as {
            messageType:
              | typeof MsgCreateBinaryOptionsMarketOrder
              | typeof MsgCreateDerivativeMarketOrder
            orderType: DerivativeOrderSide
            marketId: string
            price: string
            quantity: string
          }
        })
        .filter((p) => p !== undefined) as {
        messageType:
          | typeof MsgCreateBinaryOptionsMarketOrder
          | typeof MsgCreateDerivativeMarketOrder
        orderType: DerivativeOrderSide
        marketId: string
        price: string
        quantity: string
      }[]

      const messages = formattedPositions.map((position) =>
        position.messageType.fromJSON({
          injectiveAddress,
          margin: '0',
          triggerPrice: '0',
          marketId: position.marketId,
          subaccountId: subaccount.subaccountId,
          orderType: derivativeOrderTypeToGrpcOrderType(position.orderType),
          feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
          price: position.price,
          quantity: position.quantity
        })
      )

      await msgBroadcastClient.broadcast({
        address,
        msgs: messages,
        bucket: DerivativesMetrics.CreateMarketOrder
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
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet
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

      /*
      const message = MsgBatchUpdateOrders.fromJSON({
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        derivativeOrdersToCancel: reduceOnlyOrders.map((order) => ({
          orderHash: order.orderHash,
          marketId: order.marketId,
          subaccountId: order.subaccountId
        })),
        derivativeOrdersToCreate: [
          {
            orderType: derivativeOrderTypeToGrpcOrderType(orderType),
            feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
            margin: '0',
            triggerPrice: '0',
            marketId: actualMarket.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          }
        ]
      }) */

      const messageType =
        market && market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder

      const message = messageType.fromJSON({
        injectiveAddress,
        margin: '0',
        triggerPrice: '0',
        marketId: actualMarket.marketId,
        subaccountId: subaccount.subaccountId,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        price: liquidationPrice.toFixed(),
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        })
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateMarketOrder
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
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgIncreasePositionMargin.fromJSON({
        injectiveAddress,
        marketId: market.marketId,
        srcSubaccountId: subaccount.subaccountId,
        dstSubaccountId: subaccount.subaccountId,
        amount: derivativeMarginToChainMarginToFixed({
          value: amount,
          quoteDecimals: market.quoteToken.decimals
        })
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateMarketOrder /* TODO */
      })
    }
  }
)
