import {
  spotOrderTypeToGrpcOrderType,
  UiSpotLimitOrder,
  UiSpotMarketWithToken,
  UiSpotOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import {
  MsgBatchCancelSpotOrders,
  MsgCancelSpotOrder,
  MsgCreateSpotLimitOrder,
  MsgCreateSpotMarketOrder,
  SpotOrderSide,
  spotPriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { msgBroadcastClient } from '@/app/Services'
import { FEE_RECIPIENT } from '@/app/utils/constants'

export const batchCancelOrder = async (orders: UiSpotLimitOrder[]) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
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

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: messages
  })
}

export const cancelOrder = async (
  order: UiSpotLimitOrder | UiSpotOrderHistory
) => {
  const appStore = useAppStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
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

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitLimitOrder = async ({
  price,
  quantity,
  orderType,
  market
}: {
  price: BigNumberInBase
  quantity: BigNumberInBase
  orderType: SpotOrderSide
  market: UiSpotMarketWithToken
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

  const message = MsgCreateSpotLimitOrder.fromJSON({
    injectiveAddress,
    orderType: spotOrderTypeToGrpcOrderType(orderType),
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
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

export const submitMarketOrder = async ({
  isBuy,
  quantity,
  price,
  market
}: {
  isBuy: Boolean
  price: BigNumberInBase
  quantity: BigNumberInBase
  market: UiSpotMarketWithToken
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

  const orderType = isBuy ? SpotOrderSide.Buy : SpotOrderSide.Sell

  const message = MsgCreateSpotMarketOrder.fromJSON({
    injectiveAddress,
    orderType: spotOrderTypeToGrpcOrderType(orderType),
    price: spotPriceToChainPriceToFixed({
      value: price,
      baseDecimals: market.baseToken.decimals,
      quoteDecimals: market.quoteToken.decimals
    }),
    quantity: spotQuantityToChainQuantityToFixed({
      value: quantity,
      baseDecimals: market.baseToken.decimals
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
  quantity,
  orderType,
  market
}: {
  price: BigNumberInBase
  triggerPrice: BigNumberInBase
  quantity: BigNumberInBase
  orderType: SpotOrderSide
  market: UiSpotMarketWithToken
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

  const message = MsgCreateSpotLimitOrder.fromJSON({
    injectiveAddress,
    orderType: spotOrderTypeToGrpcOrderType(orderType),
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
  orderType,
  market
}: {
  price: BigNumberInBase
  triggerPrice: BigNumberInBase
  quantity: BigNumberInBase
  orderType: SpotOrderSide
  market: UiSpotMarketWithToken
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

  const message = MsgCreateSpotMarketOrder.fromJSON({
    injectiveAddress,
    orderType: spotOrderTypeToGrpcOrderType(orderType),
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
    marketId: market.marketId,
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    subaccountId: subaccount.subaccountId
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}
