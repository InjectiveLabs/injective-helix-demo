import {
  Position,
  PositionV2,
  MsgCancelDerivativeOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  MsgBatchCancelDerivativeOrders,
  derivativePriceToChainPriceToFixed,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { backupPromiseCall } from '@/app/utils/async'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import { UIDerivativeOrder, UiDerivativeMarket } from '@/types'

const fetchBalances = () => {
  const accountStore = useAccountStore()

  return backupPromiseCall(() =>
    Promise.all([accountStore.fetchAccountPortfolioBalances()])
  )
}

const createTpSlMessage = ({
  executionPrice,
  triggerPrice,
  quantity,
  subaccountId,
  injectiveAddress,
  marketId,
  isBuy,
  market
}: {
  triggerPrice: BigNumberInBase
  executionPrice: BigNumberInBase
  quantity: BigNumberInBase
  subaccountId: string
  injectiveAddress: string
  marketId: string
  isBuy: boolean
  market: UiDerivativeMarket
}) => {
  const orderType = getDerivativeOrderTypeToSubmit({
    isBuy,
    isPostOnly: true,
    isStopOrder: true,
    markPrice: executionPrice.toFixed(),
    triggerPrice: triggerPrice.toFixed()
  })

  const price = (
    isBuy ? triggerPrice.times(1.01) : triggerPrice.times(0.99)
  ).dp(market.priceDecimals)

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    margin: '0',
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderType)
  })

  return message
}

export const cancelOrder = async (order: UIDerivativeOrder) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const market = derivativeStore.markets.find(
    (m) => m.marketId === order.marketId
  )

  if (!market) {
    return
  }

  const message = MsgCancelDerivativeOrder.fromJSON({
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: order.subaccountId
  })

  await walletStore.broadcastMessages(message)

  await fetchBalances()
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const messages = orders.map((order: UIDerivativeOrder) => {
    return MsgBatchCancelDerivativeOrders.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  })

  await walletStore.broadcastMessages(messages)

  await fetchBalances()
}

export const submitLimitOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarket
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

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  await walletStore.broadcastMessages(message)

  await fetchBalances()
}

export const submitStopLimitOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  triggerPrice
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarket
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
  await walletStore.validate()
  await appStore.validateGeoIp()
  await appStore.validateGeoIpBasedOnDerivativesAction()

  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity.toFixed()
  })

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  await walletStore.broadcastMessages(message)

  await fetchBalances()
}

export const submitMarketOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  takeProfit,
  stopLoss
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarket
  takeProfit?: BigNumberInBase
  stopLoss?: BigNumberInBase
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

  const isTpslBuy = ![OrderSide.Buy, OrderSide.BuyPO].includes(orderSide)

  const tpMessage = takeProfit
    ? createTpSlMessage({
        executionPrice: price,
        triggerPrice: takeProfit ?? new BigNumberInBase(0),
        quantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: isTpslBuy,
        market
      })
    : undefined

  const slMessage = stopLoss
    ? createTpSlMessage({
        executionPrice: price,
        triggerPrice: stopLoss ?? new BigNumberInBase(0),
        quantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: isTpslBuy,
        market
      })
    : undefined

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    margin: reduceOnly
      ? '0'
      : derivativeMarginToChainMarginToFixed({
          value: margin.toFixed(),
          quoteDecimals: market.quoteToken.decimals
        }),
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT
  })

  const messages = [message]

  const tpSlMessages = [tpMessage, slMessage].filter(
    (msg) => msg
  ) as MsgCreateDerivativeMarketOrder[]

  await walletStore.broadcastMessages(messages)

  if (tpSlMessages.length) {
    await walletStore.broadcastMessages(tpSlMessages)
  }

  await fetchBalances()
}

export const submitStopMarketOrder = async ({
  price,
  margin,
  market,
  quantity,
  orderSide,
  reduceOnly,
  triggerPrice
}: {
  reduceOnly: boolean
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  triggerPrice: BigNumberInBase
  orderSide: OrderSide
  market: UiDerivativeMarket
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

  const msgPrice = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgTriggerPrice = derivativePriceToChainPriceToFixed({
    value: triggerPrice.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })
  const msgQuantity = derivativeQuantityToChainQuantityToFixed({
    value: quantity.toFixed()
  })

  const msgMargin = reduceOnly
    ? '0'
    : derivativeMarginToChainMarginToFixed({
        value: margin.toFixed(),
        quoteDecimals: market.quoteToken.decimals
      })

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  await walletStore.broadcastMessages(message)

  await fetchBalances()
}

export const submitTpSlOrder = async ({
  position,
  stopLoss,
  takeProfit
}: {
  position: Position | PositionV2
  takeProfit?: BigNumberInBase
  stopLoss?: BigNumberInBase
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()

  const market = derivativeStore.markets.find(
    (market) => market.marketId === position.marketId
  )

  if (!market) {
    return
  }

  const isTpslBuy = position.direction === TradeDirection.Long

  const markPrice = new BigNumberInWei(position.markPrice).toBase(
    market.quoteToken.decimals
  )

  const tpMessage = takeProfit
    ? createTpSlMessage({
        executionPrice: markPrice,
        triggerPrice: takeProfit ?? new BigNumberInBase(0),
        quantity: new BigNumberInBase(position.quantity),
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: !isTpslBuy,
        market
      })
    : undefined

  const slMessage = stopLoss
    ? createTpSlMessage({
        executionPrice: markPrice,
        triggerPrice: stopLoss ?? new BigNumberInBase(0),
        quantity: new BigNumberInBase(position.quantity),
        subaccountId: accountStore.subaccountId,
        injectiveAddress: walletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: !isTpslBuy,
        market
      })
    : undefined

  const msgs = []

  if (tpMessage) {
    msgs.push(tpMessage)
  }

  if (slMessage) {
    msgs.push(slMessage)
  }

  const tpSlMessages = [tpMessage, slMessage].filter(
    (msg) => msg
  ) as MsgCreateDerivativeMarketOrder[]

  await walletStore.broadcastMessages(tpSlMessages)

  await fetchBalances()
}
