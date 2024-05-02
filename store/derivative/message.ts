import {
  msgsOrMsgExecMsgs,
  MsgCancelDerivativeOrder,
  MsgCancelBinaryOptionsOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  MsgBatchCancelDerivativeOrders,
  MsgCreateBinaryOptionsLimitOrder,
  MsgBatchCancelBinaryOptionsOrders,
  MsgCreateBinaryOptionsMarketOrder,
  derivativePriceToChainPriceToFixed,
  derivativeMarginToChainMarginToFixed
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { msgBroadcaster } from '@shared/WalletService'
import { sharedToBalanceInWei } from '@shared/utils/formatter'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { SharedMarketType, SharedUiDerivativeMarket } from '@shared/types'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { UIDerivativeOrder } from '@/types'

export const cancelOrder = async (order: UIDerivativeOrder) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const market = derivativeStore.markets.find(
    (m) => m.marketId === order.marketId
  )

  if (!market) {
    return
  }

  const messageType =
    market && market.subType === SharedMarketType.BinaryOptions
      ? MsgCancelBinaryOptionsOrder
      : MsgCancelDerivativeOrder

  const message = messageType.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: order.subaccountId
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const messages = orders.map((order: UIDerivativeOrder) => {
    const market = derivativeStore.markets.find(
      (m) => m.marketId === order.marketId
    )
    const messageType =
      market && market.subType === SharedMarketType.BinaryOptions
        ? MsgBatchCancelBinaryOptionsOrders
        : MsgBatchCancelDerivativeOrders

    return messageType.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  })

  const actualMessages = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(messages, walletStore.authZ.address)
    : messages

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessages,
    injectiveAddress: walletStore.injectiveAddress
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
  market: SharedUiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const messageType =
    market.subType === SharedMarketType.BinaryOptions
      ? MsgCreateBinaryOptionsLimitOrder
      : MsgCreateDerivativeLimitOrder

  const message = messageType.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: sharedToBalanceInWei({ value: quantity.toFixed() }).toFixed(),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
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
  market: SharedUiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const messageType =
    market.subType === SharedMarketType.BinaryOptions
      ? MsgCreateBinaryOptionsLimitOrder
      : MsgCreateDerivativeLimitOrder

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = sharedToBalanceInWei({
    value: quantity.toFixed()
  }).toFixed()

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = messageType.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
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
  market: SharedUiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const messageType =
    market && market.subType === SharedMarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: sharedToBalanceInWei({ value: quantity.toFixed() }).toFixed(),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
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
  market: SharedUiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const messageType =
    market.subType === SharedMarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = sharedToBalanceInWei({
    value: quantity.toFixed()
  }).toFixed()

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = messageType.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}
