import {
  Position,
  PositionV2,
  DerivativeLimitOrder,
  MsgIncreasePositionMargin,
  MsgCreateDerivativeMarketOrder,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { getRoundedLiquidationPrice } from '@/app/client/utils/derivatives'
import { UiDerivativeMarket } from '@/types'
import { backupPromiseCall } from '~/app/utils/async'

export const closePosition = async ({
  market,
  position
}: {
  market: UiDerivativeMarket
  position: Position | PositionV2
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()
  const positionStore = usePositionStore()

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

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
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

  await walletStore.broadcastMessages(message)

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
  backupPromiseCall(() => positionStore.fetchPositions())
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

  await walletStore.broadcastMessages(messages)

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
  backupPromiseCall(() => positionStore.fetchPositions())
}

export const closePositionAndReduceOnlyOrders = async ({
  market,
  position
}: {
  position: Position | PositionV2
  market?: UiDerivativeMarket
  reduceOnlyOrders: DerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const positionStore = usePositionStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  const actualMarket = market as UiDerivativeMarket

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

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
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

  await walletStore.broadcastMessages(message)

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
  backupPromiseCall(() => positionStore.fetchPositions())
}

export const addMarginToPosition = async ({
  market,
  amount
}: {
  market: UiDerivativeMarket
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

  await walletStore.broadcastMessages(message)
}
