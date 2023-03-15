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

  const { subaccountId } = useBankStore()
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

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: messages
  })
}

export const cancelOrder = async (
  order: UiSpotLimitOrder | UiSpotOrderHistory
) => {
  const appStore = useAppStore()

  const { subaccountId } = useBankStore()
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

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitLimitOrder = async ({
  price,
  market,
  quantity,
  orderType
}: {
  price: BigNumberInBase
  orderType: SpotOrderSide
  quantity: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useBankStore()
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
    orderType: spotOrderTypeToGrpcOrderType(orderType)
  })

  await msgBroadcastClient.broadcastOld({
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

  const { subaccountId } = useBankStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const orderType = isBuy ? SpotOrderSide.Buy : SpotOrderSide.Sell

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
    orderType: spotOrderTypeToGrpcOrderType(orderType)
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitStopLimitOrder = async ({
  price,
  market,
  quantity,
  orderType,
  triggerPrice
}: {
  price: BigNumberInBase
  orderType: SpotOrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useBankStore()
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
    orderType: spotOrderTypeToGrpcOrderType(orderType)
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const submitStopMarketOrder = async ({
  price,
  market,
  quantity,
  orderType,
  triggerPrice
}: {
  price: BigNumberInBase
  orderType: SpotOrderSide
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  market: UiSpotMarketWithToken
}) => {
  const appStore = useAppStore()

  const { subaccountId } = useBankStore()
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
    orderType: spotOrderTypeToGrpcOrderType(orderType)
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}
