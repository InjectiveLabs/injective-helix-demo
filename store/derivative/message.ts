import {
  msgsOrMsgExecMsgs,
  MsgCancelDerivativeOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  MsgBatchCancelDerivativeOrders,
  derivativePriceToChainPriceToFixed,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { msgBroadcaster } from '@shared/WalletService'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { UIDerivativeOrder, UiDerivativeMarket } from '@/types'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'

const createTpSlMessage = ({
  executionPrice,
  triggerPrice,
  quantity,
  subaccountId,
  injectiveAddress,
  marketId,
  isBuy,
  market
}: {
  triggerPrice: BigNumberInBase
  executionPrice: BigNumberInBase
  quantity: BigNumberInBase
  subaccountId: string
  injectiveAddress: string
  marketId: string
  isBuy: boolean
  market: UiDerivativeMarket
}) => {
  const orderType = getDerivativeOrderTypeToSubmit({
    isBuy,
    isPostOnly: true,
    isStopOrder: true,
    markPrice: executionPrice.toFixed(),
    triggerPrice: triggerPrice.toFixed()
  })

  const price = (
    isBuy ? triggerPrice.times(1.01) : triggerPrice.times(0.99)
  ).dp(market.priceDecimals)

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    margin: '0',
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderType)
  })

  return message
}

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

  const message = MsgCancelDerivativeOrder.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: order.subaccountId
  })

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
  })
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const messages = orders.map((order: UIDerivativeOrder) => {
    return MsgBatchCancelDerivativeOrders.fromJSON({
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

  let actualMessages

  if (walletStore.isAuthzWalletConnected) {
    actualMessages = msgsOrMsgExecMsgs(messages, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessages = msgsOrMsgExecMsgs(
      messages,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessages = messages
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessages,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
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
  market: UiDerivativeMarket
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

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
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
  market: UiDerivativeMarket
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
  await walletStore.validate()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity.toFixed()
  })

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
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

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
  })
}

export const submitMarketOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  takeProfit,
  stopLoss
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarket
  takeProfit?: BigNumberInBase
  stopLoss?: BigNumberInBase
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

  const isTpslBuy = ![OrderSide.Buy, OrderSide.BuyPO].includes(orderSide)

  const tpMessage = takeProfit
    ? createTpSlMessage({
        executionPrice: price,
        triggerPrice: takeProfit ?? new BigNumberInBase(0),
        quantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: isTpslBuy,
        market
      })
    : undefined

  const slMessage = stopLoss
    ? createTpSlMessage({
        executionPrice: price,
        triggerPrice: stopLoss ?? new BigNumberInBase(0),
        quantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: isTpslBuy,
        market
      })
    : undefined

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  const messages = [message]

  // TPSL
  const tpSlMessages = [tpMessage, slMessage].filter(
    (msg) => msg
  ) as MsgCreateDerivativeMarketOrder[]

  let actualTpSlMessages

  if (walletStore.isAuthzWalletConnected) {
    actualTpSlMessages = msgsOrMsgExecMsgs(
      tpSlMessages,
      walletStore.injectiveAddress
    )
  } else if (walletStore.autoSign) {
    actualTpSlMessages = msgsOrMsgExecMsgs(
      tpSlMessages,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualTpSlMessages = tpSlMessages
  }

  // TPSL END

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(messages, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(
      messages,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = messages
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
  })

  if (tpSlMessages.length) {
    await msgBroadcaster.broadcastWithFeeDelegation({
      msgs: actualTpSlMessages,
      injectiveAddress: walletStore.autoSign
        ? walletStore.autoSign.injectiveAddress
        : walletStore.injectiveAddress
    })
  }
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
  market: UiDerivativeMarket
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

  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity.toFixed()
  })

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
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

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injectiveAddress
      : walletStore.injectiveAddress
  })
}
