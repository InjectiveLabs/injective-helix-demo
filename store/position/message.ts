import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedBackupPromiseCall } from '@shared/utils/async'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import {
  MsgCancelDerivativeOrder,
  MsgIncreasePositionMargin,
  MsgCreateDerivativeMarketOrder,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { prepareNeptuneWithdrawMessage } from '@/app/utils/msgs'
import { getRoundedLiquidationPrice } from '@/app/client/utils/derivatives'
import { ConditionalOrderSide } from '@/types'
import type { UiDerivativeMarket } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

export const closePosition = async ({
  quantity,
  position,
  availablePositionQuantity
}: {
  quantity: string
  position: PositionV2
  availablePositionQuantity: BigNumberInBase
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const market = derivativeStore.marketByIdOrSlug(position.marketId)

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()

  const orderType = orderSideToOrderType(
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  )

  const liquidationPrice = getRoundedLiquidationPrice(
    { ...position, quantity },
    market
  )

  const remainingQuantity = availablePositionQuantity.minus(quantity)

  const selectedPositionConditionalOrders =
    derivativeStore.subaccountConditionalOrders.filter(
      (order) => order.marketId === market.marketId
    )

  const tpOrder = selectedPositionConditionalOrders.find(
    (item) =>
      item.orderType === ConditionalOrderSide.TakeBuy ||
      item.orderType === ConditionalOrderSide.TakeSell
  )

  const slOrder = selectedPositionConditionalOrders.find(
    (item) =>
      item.orderType === ConditionalOrderSide.StopBuy ||
      item.orderType === ConditionalOrderSide.StopSell
  )

  const tpOrderQuantity = tpOrder?.quantity
  const slOrderQuantity = slOrder?.quantity

  const messages = MsgCreateDerivativeMarketOrder.fromJSON({
    margin: '0',
    triggerPrice: '0',
    marketId: position.marketId,
    feeRecipient: referralStore.feeRecipient,
    price: liquidationPrice.toFixed(),
    subaccountId: accountStore.subaccountId,
    orderType,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity
    })
  })

  const msgs = []
  msgs.push(messages)

  if (
    tpOrder &&
    new BigNumberInBase(remainingQuantity).lt(tpOrderQuantity || 0)
  ) {
    const cancelTpMessage = MsgCancelDerivativeOrder.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      marketId: tpOrder.marketId,
      orderHash: tpOrder.orderHash,
      subaccountId: tpOrder.subaccountId
    })

    msgs.push(cancelTpMessage)
  }

  if (
    slOrder &&
    new BigNumberInBase(remainingQuantity).lt(slOrderQuantity || 0)
  ) {
    const cancelSlMessage = MsgCancelDerivativeOrder.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      marketId: slOrder.marketId,
      orderHash: slOrder.orderHash,
      subaccountId: slOrder.subaccountId
    })

    msgs.push(cancelSlMessage)
  }

  await sharedWalletStore.broadcastWithFeeDelegation({ messages: msgs })

  sharedBackupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const closeAllPosition = async (positions: PositionV2[]) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    positions.length === 0 ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validate()

  const formattedPositions = positions
    .map((position) => {
      const market = derivativeStore.marketByIdOrSlug(position.marketId)

      if (!market) {
        return undefined
      }

      const orderType =
        position.direction === TradeDirection.Long
          ? OrderSide.Sell
          : OrderSide.Buy
      const liquidationPrice = getRoundedLiquidationPrice(position, market)

      return {
        orderType,
        marketId: market.marketId,
        price: liquidationPrice.toFixed(),
        messageType: MsgCreateDerivativeMarketOrder,
        quantity: derivativeQuantityToChainQuantityToFixed({
          value: position.quantity
        })
      } as {
        price: string
        marketId: string
        quantity: string
        orderType: OrderSide
        messageType: typeof MsgCreateDerivativeMarketOrder
      }
    })
    .filter((p) => p !== undefined) as {
    price: string
    marketId: string
    quantity: string
    orderType: OrderSide
    messageType: typeof MsgCreateDerivativeMarketOrder
  }[]

  const messages = formattedPositions.map((position) =>
    position.messageType.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      margin: '0',
      triggerPrice: '0',
      price: position.price,
      quantity: position.quantity,
      marketId: position.marketId,
      subaccountId: accountStore.subaccountId,
      feeRecipient: referralStore.feeRecipient,
      orderType: orderSideToOrderType(position.orderType)
    })
  )

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  sharedBackupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const addMarginToPosition = async ({
  market,
  amount
}: {
  amount: BigNumberInBase
  market: UiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const amountToFixed = derivativeMarginToChainMarginToFixed({
    value: amount.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: market.quoteDenom,
    amount: amountToFixed
  })

  const increasePositionMessage = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: accountStore.subaccountId,
    dstSubaccountId: accountStore.subaccountId,
    amount: amountToFixed
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20Messages, increasePositionMessage]
  })
}

export const addMarginToSubaccountPosition = async ({
  market,
  amount,
  fromSubaccountId,
  toSubaccountId
}: {
  toSubaccountId: string
  amount: BigNumberInBase
  fromSubaccountId: string
  market: UiDerivativeMarket
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !fromSubaccountId ||
    !toSubaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const messages = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: fromSubaccountId,
    dstSubaccountId: toSubaccountId,
    amount: derivativeMarginToChainMarginToFixed({
      value: amount.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    })
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
}
