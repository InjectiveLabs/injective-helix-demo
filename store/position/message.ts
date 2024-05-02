import {
  Position,
  PositionV2,
  msgsOrMsgExecMsgs,
  DerivativeLimitOrder,
  MsgIncreasePositionMargin,
  MsgCreateDerivativeMarketOrder,
  MsgCreateBinaryOptionsMarketOrder,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { msgBroadcaster } from '@shared/WalletService'
import { BigNumberInBase } from '@injectivelabs/utils'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { SharedMarketType, SharedUiDerivativeMarket } from '@shared/types'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { getRoundedLiquidationPrice } from '@/app/client/utils/derivatives'

export const closePosition = async ({
  market,
  position
}: {
  market: SharedUiDerivativeMarket
  position: Position | PositionV2
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
    market.subType === SharedMarketType.BinaryOptions
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

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const closeAllPosition = async (
  positions: Array<Position | PositionV2>
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
        market.subType === SharedMarketType.BinaryOptions
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

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessages,
    injectiveAddress: walletStore.injectiveAddress
  })

  await positionStore.fetchSubaccountPositions()
}

export const closePositionAndReduceOnlyOrders = async ({
  market,
  position
}: {
  position: Position | PositionV2
  market?: SharedUiDerivativeMarket
  reduceOnlyOrders: DerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  const actualMarket = market as SharedUiDerivativeMarket

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
    actualMarket.subType === SharedMarketType.BinaryOptions
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

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await positionStore.fetchSubaccountPositions()
}

export const addMarginToPosition = async ({
  market,
  amount
}: {
  market: SharedUiDerivativeMarket
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
      value: amount.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    })
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}
