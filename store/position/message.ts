import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import {
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeMarketOrder,
  MsgIncreasePositionMargin,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
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
  position: UiPosition
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

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, market)

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    margin: '0',
    injectiveAddress,
    triggerPrice: '0',
    marketId: position.marketId,
    feeRecipient: FEE_RECIPIENT,
    price: liquidationPrice.toFixed(),
    subaccountId,
    orderType: orderSideToOrderType(orderType),
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    })
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}

export const closeAllPosition = async (positions: UiPosition[]) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()

  const { subaccountId } = useAccountStore()
  const { markets } = useDerivativeStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || positions.length === 0) {
    return
  }

  await appStore.queue()
  await validate()

  const formattedPositions = positions
    .map((position) => {
      const market = markets.find((m) => m.marketId === position.marketId)

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
      injectiveAddress,
      margin: '0',
      triggerPrice: '0',
      price: position.price,
      quantity: position.quantity,
      marketId: position.marketId,
      feeRecipient: FEE_RECIPIENT,
      subaccountId,
      orderType: orderSideToOrderType(position.orderType)
    })
  )

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: messages
  })

  await positionStore.fetchSubaccountPositions()
}

export const closePositionAndReduceOnlyOrders = async ({
  market,
  position
}: {
  position: UiPosition
  market?: UiDerivativeMarketWithToken
  reduceOnlyOrders: UiDerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  const actualMarket = market as UiDerivativeMarketWithToken

  if (!isUserWalletConnected || !subaccountId || !actualMarket) {
    return
  }

  await appStore.queue()
  await validate()

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, actualMarket)

  const messageType =
    actualMarket.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    margin: '0',
    injectiveAddress,
    triggerPrice: '0',
    feeRecipient: FEE_RECIPIENT,
    marketId: actualMarket.marketId,
    price: liquidationPrice.toFixed(),
    subaccountId,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    }),
    orderType: orderSideToOrderType(orderType)
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
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

  const { subaccountId } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccountId || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: subaccountId,
    dstSubaccountId: subaccountId,
    amount: derivativeMarginToChainMarginToFixed({
      value: amount,
      quoteDecimals: market.quoteToken.decimals
    })
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })
}
