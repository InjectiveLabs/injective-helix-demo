import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  DerivativeOrderSide,
  MsgCreateBinaryOptionsMarketOrder,
  MsgCreateDerivativeMarketOrder,
  MsgIncreasePositionMargin,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import {
  derivativeOrderTypeToGrpcOrderType,
  MarketType,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiPosition
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

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const orderType =
    position.direction === TradeDirection.Long
      ? DerivativeOrderSide.Sell
      : DerivativeOrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, market)

  const messageType =
    market.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    injectiveAddress,
    margin: '0',
    triggerPrice: '0',
    marketId: position.marketId,
    subaccountId: subaccount.subaccountId,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    price: liquidationPrice.toFixed(),
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    })
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}

export const closeAllPosition = async (positions: UiPosition[]) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()

  const { subaccount } = useAccountStore()
  const { markets } = useDerivativeStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  if (!isUserWalletConnected || !subaccount || positions.length === 0) {
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
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy
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
        messageType:
          | typeof MsgCreateBinaryOptionsMarketOrder
          | typeof MsgCreateDerivativeMarketOrder
        orderType: DerivativeOrderSide
        marketId: string
        price: string
        quantity: string
      }
    })
    .filter((p) => p !== undefined) as {
    messageType:
      | typeof MsgCreateBinaryOptionsMarketOrder
      | typeof MsgCreateDerivativeMarketOrder
    orderType: DerivativeOrderSide
    marketId: string
    price: string
    quantity: string
  }[]

  const messages = formattedPositions.map((position) =>
    position.messageType.fromJSON({
      injectiveAddress,
      margin: '0',
      triggerPrice: '0',
      marketId: position.marketId,
      subaccountId: subaccount.subaccountId,
      orderType: derivativeOrderTypeToGrpcOrderType(position.orderType),
      feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
      price: position.price,
      quantity: position.quantity
    })
  )

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: messages
  })

  await positionStore.fetchSubaccountPositions()
}

export const closePositionAndReduceOnlyOrders = async ({
  market,
  position
}: {
  market?: UiDerivativeMarketWithToken
  position: UiPosition
  reduceOnlyOrders: UiDerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()
  const { feeRecipient: referralFeeRecipient } = useReferralStore()

  const actualMarket = market as UiDerivativeMarketWithToken

  if (!isUserWalletConnected || !subaccount || !actualMarket) {
    return
  }

  await appStore.queue()
  await validate()

  const orderType =
    position.direction === TradeDirection.Long
      ? DerivativeOrderSide.Sell
      : DerivativeOrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, actualMarket)

  /*
      const message = MsgBatchUpdateOrders.fromJSON({
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        derivativeOrdersToCancel: reduceOnlyOrders.map((order) => ({
          orderHash: order.orderHash,
          marketId: order.marketId,
          subaccountId: order.subaccountId
        })),
        derivativeOrdersToCreate: [
          {
            orderType: derivativeOrderTypeToGrpcOrderType(orderType),
            feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
            margin: '0',
            triggerPrice: '0',
            marketId: actualMarket.marketId,
            price: liquidationPrice.toFixed(),
            quantity: derivativeQuantityToChainQuantityToFixed({
              value: position.quantity
            })
          }
        ]
      }) */

  const messageType =
    actualMarket.subType === MarketType.BinaryOptions
      ? MsgCreateBinaryOptionsMarketOrder
      : MsgCreateDerivativeMarketOrder

  const message = messageType.fromJSON({
    injectiveAddress,
    margin: '0',
    triggerPrice: '0',
    marketId: actualMarket.marketId,
    subaccountId: subaccount.subaccountId,
    orderType: derivativeOrderTypeToGrpcOrderType(orderType),
    feeRecipient: referralFeeRecipient || FEE_RECIPIENT,
    price: liquidationPrice.toFixed(),
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    })
  })

  await msgBroadcastClient.broadcastOld({
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

  const { subaccount } = useAccountStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!isUserWalletConnected || !subaccount || !market) {
    return
  }

  await appStore.queue()
  await validate()

  const message = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: subaccount.subaccountId,
    dstSubaccountId: subaccount.subaccountId,
    amount: derivativeMarginToChainMarginToFixed({
      value: amount,
      quoteDecimals: market.quoteToken.decimals
    })
  })

  await msgBroadcastClient.broadcastOld({
    address,
    msgs: message
  })
}
