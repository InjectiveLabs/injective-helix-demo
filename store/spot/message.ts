import {
  UiSpotLimitOrder,
  UiSpotOrderHistory,
  orderSideToOrderType,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  MsgCancelSpotOrder,
  MsgBatchCancelSpotOrders,
  MsgCreateSpotLimitOrder,
  MsgCreateSpotMarketOrder,
  spotPriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { msgBroadcastClient } from '@/app/Services'
import { FEE_RECIPIENT } from '@/app/utils/constants'

export const batchCancelOrder = async (orders: UiSpotLimitOrder[]) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  await appStore.queue()
  await validate()

  const messages = orders.map((order) =>
    MsgBatchCancelSpotOrders.fromJSON({
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

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: messages
  })
}

export const cancelOrder = async (
  order: UiSpotLimitOrder | UiSpotOrderHistory
) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgCancelSpotOrder.fromJSON({
    injectiveAddress,
    marketId: order.marketId,
    subaccountId: order.subaccountId,
    orderHash: order.orderHash
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}

export const submitLimitOrder = async ({
  price,
  market,
  quantity,
  orderSide
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
    }),
    orderType: orderSideToOrderType(orderSide)
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}

export const submitMarketOrder = async ({
  isBuy,
  price,
  market,
  quantity
}: {
  isBuy: Boolean
  price: BigNumberInBase
  quantity: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const orderType = isBuy ? OrderSide.Buy : OrderSide.Sell

  const message = MsgCreateSpotMarketOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
    }),
    orderType: orderSideToOrderType(orderType)
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}

export const submitStopLimitOrder = async ({
  price,
  market,
  quantity,
  orderSide,
  triggerPrice
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: spotPriceToChainPriceToFixed({
      value: triggerPrice,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
    }),
    orderType: orderSideToOrderType(orderSide)
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}

export const submitStopMarketOrder = async ({
  price,
  market,
  quantity,
  orderSide,
  triggerPrice
}: {
  price: BigNumberInBase
  orderSide: OrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgCreateSpotMarketOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: spotPriceToChainPriceToFixed({
      value: triggerPrice,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
    }),
    orderType: orderSideToOrderType(orderSide)
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}
