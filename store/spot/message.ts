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
  spotQuantityToChainQuantityToFixed,
  msgsOrMsgExecMsgs
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { msgBroadcastClient } from '@/app/Services'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { convertCw20ToBankBalance } from '@/app/utils/market'
import { backupPromiseCall } from '@/app/utils/async'

export const batchCancelOrder = async (orders: UiSpotLimitOrder[]) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const messages = orders.map((order) =>
    MsgBatchCancelSpotOrders.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  )

  const actualMessages = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(messages, walletStore.injectiveAddress)
    : messages

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessages,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const cancelOrder = async (
  order: UiSpotLimitOrder | UiSpotOrderHistory
) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgCancelSpotOrder.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    subaccountId: order.subaccountId,
    orderHash: order.orderHash
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const priceToFixed = spotPriceToChainPriceToFixed({
    value: price,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })
  const quantityToFixed = spotQuantityToChainQuantityToFixed({
    value: quantity,
    baseDecimals: market.baseToken.decimals
  })

  const cw20ConvertMessage = convertCw20ToBankBalance({
    market,
    injectiveAddress: walletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap,
    order: {
      market,
      orderSide,
      price: priceToFixed,
      quantity: quantityToFixed
    }
  })

  const orderMessage = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: priceToFixed,
    quantity: quantityToFixed,
    orderType: orderSideToOrderType(orderSide)
  })

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : orderMessage

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  if (cw20ConvertMessage) {
    await backupPromiseCall(() => accountStore.fetchCw20Balances())
  }
}

export const submitMarketOrder = async ({
  orderSide,
  price,
  market,
  quantity
}: {
  orderSide: OrderSide
  price: BigNumberInBase
  quantity: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const priceToFixed = spotPriceToChainPriceToFixed({
    value: price,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })
  const quantityToFixed = spotQuantityToChainQuantityToFixed({
    value: quantity,
    baseDecimals: market.baseToken.decimals
  })

  const cw20ConvertMessage = convertCw20ToBankBalance({
    market,
    injectiveAddress: walletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap,
    order: {
      market,
      orderSide,
      price: priceToFixed,
      quantity: quantityToFixed
    }
  })

  const orderMessage = MsgCreateSpotMarketOrder.fromJSON({
    price: priceToFixed,
    quantity: quantityToFixed,
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.autoSign
      ? walletStore.injectiveAddress
      : walletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    orderType: orderSideToOrderType(orderSide)
  })

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, orderMessage]
    : orderMessage

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.autoSign.injAddress)
  } else {
    actualMessage = message
  }

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.autoSign
      ? walletStore.autoSign.injAddress
      : walletStore.injectiveAddress
  })

  if (cw20ConvertMessage) {
    await backupPromiseCall(() => accountStore.fetchCw20Balances())
  }
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const message = MsgCreateSpotLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !market
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnSpotAction(market)
  await walletStore.validate()

  const message = MsgCreateSpotMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}
