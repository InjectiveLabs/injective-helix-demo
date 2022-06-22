import { actionTree, getterTree } from 'typed-vuex'
import {
  BigNumberInBase,
  derivativeMarginToChainMarginToFixed,
  derivativePriceToChainPriceToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/utils'
import {
  derivativeOrderTypeToGrpcOrderType,
  DerivativesMetrics,
  UiDerivativeLimitOrder,
  ZERO_TO_STRING
} from '@injectivelabs/sdk-ui-ts'
import {
  DerivativeOrderSide,
  MsgBatchCancelBinaryOptionsOrders,
  MsgBatchCancelDerivativeOrders,
  MsgCreateBinaryOptionsLimitOrder,
  MsgCreateBinaryOptionsMarketOrder
} from '@injectivelabs/sdk-ts'
import { FEE_RECIPIENT } from '~/app/utils/constants'
import { msgBroadcastClient } from '~/app/Services'

export const state = () => ({
  //
})

export type BinaryOptionsStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  //
}

export const actions = actionTree(
  { state, mutations },
  {
    async cancelOrder(_, order: UiDerivativeLimitOrder) {
      const { subaccount } = this.app.$accessor.account
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgBatchCancelBinaryOptionsOrders.fromJSON({
        injectiveAddress,
        orders: [
          {
            marketId: order.marketId,
            subaccountId: order.subaccountId,
            orderHash: order.orderHash
          }
        ]
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.BatchCancelLimitOrders
      })
    },

    async batchCancelOrder(_, orders: UiDerivativeLimitOrder[]) {
      const { subaccount } = this.app.$accessor.account
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const messages = orders.map((order) =>
        MsgBatchCancelDerivativeOrders.fromJSON({
          injectiveAddress,
          orders: [
            {
              marketId: order.marketId,
              subaccountId: order.subaccountId,
              orderHash: order.orderHash
            }
          ]
        })
      )

      await msgBroadcastClient.broadcast({
        address,
        msgs: messages,
        bucket: DerivativesMetrics.BatchCancelLimitOrders
      })
    },

    async submitLimitOrder(
      _,
      {
        price,
        reduceOnly,
        margin,
        quantity,
        orderType
      }: {
        reduceOnly: boolean
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderSide
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgCreateBinaryOptionsLimitOrder.fromJSON({
        injectiveAddress,
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: reduceOnly
          ? ZERO_TO_STRING
          : derivativeMarginToChainMarginToFixed({
              value: margin,
              quoteDecimals: market.quoteToken.decimals
            }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateLimitOrder
      })
    },

    async submitMarketOrder(
      _,
      {
        quantity,
        price,
        margin,
        reduceOnly,
        orderType
      }: {
        reduceOnly: boolean
        price: BigNumberInBase
        margin: BigNumberInBase
        quantity: BigNumberInBase
        orderType: DerivativeOrderSide
      }
    ) {
      const { subaccount } = this.app.$accessor.account
      const { market } = this.app.$accessor.derivatives
      const { feeRecipient: referralFeeRecipient } = this.app.$accessor.referral
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount || !market) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgCreateBinaryOptionsMarketOrder.fromJSON({
        injectiveAddress,
        triggerPrice: '0',
        orderType: derivativeOrderTypeToGrpcOrderType(orderType),
        price: derivativePriceToChainPriceToFixed({
          value: price,
          quoteDecimals: market.quoteToken.decimals
        }),
        quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
        margin: reduceOnly
          ? ZERO_TO_STRING
          : derivativeMarginToChainMarginToFixed({
              value: margin,
              quoteDecimals: market.quoteToken.decimals
            }),
        marketId: market.marketId,
        feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
        subaccountId: subaccount.subaccountId
      })

      await msgBroadcastClient.broadcast({
        address,
        msgs: message,
        bucket: DerivativesMetrics.CreateMarketOrder
      })
    }
  }
)
