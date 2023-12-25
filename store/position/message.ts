import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import {
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeMarketOrder,
  MsgIncreasePositionMargin,
  PositionV2,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed,
  msgsOrMsgExecMsgs
} from '@injectivelabs/sdk-ts'
import {
  UiPosition,
  MarketType,
  orderSideToOrderType,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { getRoundedLiquidationPrice } from '@/app/client/utils/derivatives'
import { msgBroadcastClient } from '@/app/Services'

export const closePosition = async ({
  market,
  position
}: {
  market: UiDerivativeMarketWithToken
  position: UiPosition | PositionV2
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

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, market)

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    margin: '0',
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    triggerPrice: '0',
    marketId: position.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: liquidationPrice.toFixed(),
    subaccountId: accountStore.subaccountId,
    orderType: orderSideToOrderType(orderType),
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    })
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const closeAllPosition = async (
  positions: Array<UiPosition | PositionV2>
) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()
  const derivativeStore = useDerivativeStore()

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    positions.length === 0
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const formattedPositions = positions
    .map((position) => {
      const market = derivativeStore.markets.find(
        (m) => m.marketId === position.marketId
      )

      if (!market) {
        return undefined
      }

      const messageType =
        market.subType === MarketType.BinaryOptions
          ? MsgCreateBinaryOptionsMarketOrder
          : MsgCreateDerivativeMarketOrder
      const orderType =
        position.direction === TradeDirection.Long
          ? OrderSide.Sell
          : OrderSide.Buy
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
        price: string
        marketId: string
        quantity: string
        orderType: OrderSide
        messageType:
          | typeof MsgCreateBinaryOptionsMarketOrder
          | typeof MsgCreateDerivativeMarketOrder
      }
    })
    .filter((p) => p !== undefined) as {
    price: string
    marketId: string
    quantity: string
    orderType: OrderSide
    messageType:
      | typeof MsgCreateBinaryOptionsMarketOrder
      | typeof MsgCreateDerivativeMarketOrder
  }[]

  const messages = formattedPositions.map((position) =>
    position.messageType.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      margin: '0',
      triggerPrice: '0',
      price: position.price,
      quantity: position.quantity,
      marketId: position.marketId,
      feeRecipient: FEE_RECIPIENT,
      subaccountId: accountStore.subaccountId,
      orderType: orderSideToOrderType(position.orderType)
    })
  )

  const actualMessages = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(messages, walletStore.injectiveAddress)
    : messages

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessages,
    injectiveAddress: walletStore.injectiveAddress
  })

  await positionStore.fetchSubaccountPositions()
}

export const closePositionAndReduceOnlyOrders = async ({
  market,
  position
}: {
  position: UiPosition | PositionV2
  market?: UiDerivativeMarketWithToken
  reduceOnlyOrders: UiDerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  const actualMarket = market as UiDerivativeMarketWithToken

  if (
    !walletStore.isUserWalletConnected ||
    !accountStore.subaccountId ||
    !actualMarket
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, actualMarket)

  const messageType =
    actualMarket.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    margin: '0',
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    triggerPrice: '0',
    feeRecipient: FEE_RECIPIENT,
    marketId: actualMarket.marketId,
    price: liquidationPrice.toFixed(),
    subaccountId: accountStore.subaccountId,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    }),
    orderType: orderSideToOrderType(orderType)
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await positionStore.fetchSubaccountPositions()
}

export const addMarginToPosition = async ({
  market,
  amount
}: {
  market: UiDerivativeMarketWithToken
  amount: BigNumberInBase
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

  const message = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: accountStore.subaccountId,
    dstSubaccountId: accountStore.subaccountId,
    amount: derivativeMarginToChainMarginToFixed({
      value: amount,
      quoteDecimals: market.quoteToken.decimals
    })
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}
