import { BigNumberInBase } from '@injectivelabs/utils'
import {
  derivativeOrderTypeToGrpcOrderType,
  MarketType,
  UiDerivativeMarketWithToken,
  ZERO_TO_STRING
} from '@injectivelabs/sdk-ui-ts'
import {
  derivativeMarginToChainMarginToFixed,
  DerivativeOrderSide,
  derivativePriceToChainPriceToFixed,
  derivativeQuantityToChainQuantityToFixed,
  MsgBatchCancelBinaryOptionsOrders,
  MsgBatchCancelDerivativeOrders,
  MsgCancelBinaryOptionsOrder,
  MsgCancelDerivativeOrder,
  MsgCreateBinaryOptionsLimitOrder,
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder
} from '@injectivelabs/sdk-ts'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { msgBroadcastClient } from '@/app/Services'
import { UIDerivativeOrder } from '@/types'

export const cancelOrder = async (order: UIDerivativeOrder) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { markets } = useDerivativeStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
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
    subaccountId: order.subaccountId,
    orderHash: order.orderHash
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const appStore = useAppStore()

  const { markets } = useDerivativeStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
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

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: messages
  })
}

export const submitLimitOrder = async ({
  price,
  reduceOnly,
  margin,
  market,
  quantity,
  orderType
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  market: UiDerivativeMarketWithToken
  quantity: BigNumberInBase
  orderType: DerivativeOrderSide
}) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsLimitOrder
      : MsgCreateDerivativeLimitOrder

  const message = messageType.fromJSON({
    injectiveAddress,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
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
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    subaccountId: subaccount.subaccountId
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitStopLimitOrder = async ({
  price,
  triggerPrice,
  reduceOnly,
  margin,
  market,
  quantity,
  orderType
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  triggerPrice: BigNumberInBase
  margin: BigNumberInBase
  market: UiDerivativeMarketWithToken
  quantity: BigNumberInBase
  orderType: DerivativeOrderSide
}) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || !market) {
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
    injectiveAddress,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
    triggerPrice: msgTriggerPrice,
    price: msgPrice,
    quantity: msgQuantity,
    margin: msgMargin,
    marketId: market.marketId,
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    subaccountId: subaccount.subaccountId
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitMarketOrder = async ({
  quantity,
  price,
  margin,
  market,
  reduceOnly,
  orderType
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  market: UiDerivativeMarketWithToken
  quantity: BigNumberInBase
  orderType: DerivativeOrderSide
}) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const messageType =
    market && market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    injectiveAddress,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
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
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    subaccountId: subaccount.subaccountId
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitStopMarketOrder = async ({
  quantity,
  price,
  triggerPrice,
  margin,
  market,
  reduceOnly,
  orderType
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  triggerPrice: BigNumberInBase
  margin: BigNumberInBase
  market: UiDerivativeMarketWithToken
  quantity: BigNumberInBase
  orderType: DerivativeOrderSide
}) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || !market) {
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
    injectiveAddress,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
    price: msgPrice,
    triggerPrice: msgTriggerPrice,
    quantity: msgQuantity,
    margin: msgMargin,
    marketId: market.marketId,
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    subaccountId: subaccount.subaccountId
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}
