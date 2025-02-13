import {
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
import { backupPromiseCall } from '@/app/utils/async'

export const closePosition = async (position: PositionV2) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const market = derivativeStore.markets.find(
    (m) => m.marketId === position.marketId
  )

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, market)

  const messages = MsgCreateDerivativeMarketOrder.fromJSON({
    margin: '0',
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
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

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const closeAllPosition = async (positions: PositionV2[]) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    positions.length === 0 ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

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
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
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

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const closePositionAndReduceOnlyOrders = async ({
  position
}: {
  position: PositionV2
  reduceOnlyOrders: DerivativeLimitOrder[]
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const market = derivativeStore.markets.find(
    (m) => m.marketId === position.marketId
  )

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await appStore.validateGeoIpBasedOnDerivativesAction()
  await walletStore.validate()

  const orderType =
    position.direction === TradeDirection.Long ? OrderSide.Sell : OrderSide.Buy
  const liquidationPrice = getRoundedLiquidationPrice(position, market)

  const messages = MsgCreateDerivativeMarketOrder.fromJSON({
    margin: '0',
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    triggerPrice: '0',
    feeRecipient: FEE_RECIPIENT,
    marketId: market.marketId,
    price: liquidationPrice.toFixed(),
    subaccountId: accountStore.subaccountId,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: position.quantity
    }),
    orderType: orderSideToOrderType(orderType)
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const addMarginToPosition = async ({
  market,
  amount
}: {
  market: UiDerivativeMarket
  amount: BigNumberInBase
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

  const messages = MsgIncreasePositionMargin.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: market.marketId,
    srcSubaccountId: accountStore.subaccountId,
    dstSubaccountId: accountStore.subaccountId,
    amount: derivativeMarginToChainMarginToFixed({
      value: amount.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    })
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
}
