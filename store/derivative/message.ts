import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketType,
  ZERO_TO_STRING,
  orderSideToOrderType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  MsgCancelDerivativeOrder,
  MsgCancelBinaryOptionsOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  MsgBatchCancelDerivativeOrders,
  MsgCreateBinaryOptionsLimitOrder,
  MsgBatchCancelBinaryOptionsOrders,
  MsgCreateBinaryOptionsMarketOrder,
  derivativePriceToChainPriceToFixed,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { FEE_PAYER_PUB_KEY, FEE_RECIPIENT } from '@/app/utils/constants'
import { msgBroadcastClient } from '@/app/Services'
import { UIDerivativeOrder } from '@/types'

export const cancelOrder = async (order: UIDerivativeOrder) => {
  const appStore = useAppStore()

  const { subaccountId } = useAccountStore()
  const { markets } = useDerivativeStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  await appStore.queue()
  await validate()

  const market = markets.find((m) => m.marketId === order.marketId)
  const messageType =
    market && market.subType === MarketType.BinaryOptions
      ? MsgCancelBinaryOptionsOrder
      : MsgCancelDerivativeOrder

  const message = messageType.fromJSON({
    injectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: order.subaccountId
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const appStore = useAppStore()

  const { markets } = useDerivativeStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  await appStore.queue()
  await validate()

  const messages = orders.map((order: UIDerivativeOrder) => {
    const market = markets.find((m) => m.marketId === order.marketId)
    const messageType =
      market && market.subType === MarketType.BinaryOptions
        ? MsgBatchCancelBinaryOptionsOrders
        : MsgBatchCancelDerivativeOrders

    return messageType.fromJSON({
      injectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: messages
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: messages
      })
}

export const submitLimitOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarketWithToken
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

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsLimitOrder
      : MsgCreateDerivativeLimitOrder

  const message = messageType.fromJSON({
    subaccountId,
    injectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
    margin: reduceOnly
      ? ZERO_TO_STRING
      : derivativeMarginToChainMarginToFixed({
          value: margin,
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
}

export const submitStopLimitOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  triggerPrice
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarketWithToken
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

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsLimitOrder
      : MsgCreateDerivativeLimitOrder

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice,
    quoteDecimals: market.quoteToken.decimals
  })
  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price,
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity
  })
  const msgMargin = reduceOnly
    ? ZERO_TO_STRING
    : derivativeMarginToChainMarginToFixed({
        value: margin,
        quoteDecimals: market.quoteToken.decimals
      })

  const message = messageType.fromJSON({
    subaccountId,
    injectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
}

export const submitMarketOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarketWithToken
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

  const messageType =
    market && market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    subaccountId,
    injectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price,
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({ value: quantity }),
    margin: reduceOnly
      ? ZERO_TO_STRING
      : derivativeMarginToChainMarginToFixed({
          value: margin,
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
}

export const submitStopMarketOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  triggerPrice
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarketWithToken
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

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price,
    quoteDecimals: market.quoteToken.decimals
  })
  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice,
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity
  })
  const msgMargin = reduceOnly
    ? ZERO_TO_STRING
    : derivativeMarginToChainMarginToFixed({
        value: margin,
        quoteDecimals: market.quoteToken.decimals
      })

  const message = messageType.fromJSON({
    subaccountId,
    injectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  FEE_PAYER_PUB_KEY
    ? await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
    : await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })
}
