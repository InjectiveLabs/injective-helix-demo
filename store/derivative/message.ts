import {
  Msgs,
  PositionV2,
  DerivativeLimitOrder,
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
import { backupPromiseCall } from '@/app/utils/async'
import { prepareOrderMessages } from '@/app/utils/msgs'
import { orderSideToChaseOrderType } from '@/app/utils/trade'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import {
  UIDerivativeOrder,
  UiDerivativeMarket,
  ConditionalOrderSide
} from '@/types'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()

  return backupPromiseCall(() =>
    Promise.all([
      derivativeStore.fetchSubaccountOrders(),
      accountStore.fetchAccountPortfolioBalances(),
      ...(shouldFetchCw20Balances ? [accountStore.fetchCw20Balances()] : [])
    ])
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
  const referralStore = useReferralStore()

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
    feeRecipient: referralStore.feeRecipient,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderType)
  })

  return message
}

export const cancelOrder = async (order: UIDerivativeOrder) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await walletStore.validate()

  const market = derivativeStore.markets.find(
    (m) => m.marketId === order.marketId
  )

  if (!market) {
    return
  }

  const messages = MsgCancelDerivativeOrder.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: order.subaccountId
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await fetchBalances()

  backupPromiseCall(() =>
    Promise.all([
      derivativeStore.fetchSubaccountOrders(),
      derivativeStore.fetchSubaccountConditionalOrders()
    ])
  )
}

export const batchCancelOrder = async (orders: UIDerivativeOrder[]) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  await walletStore.validate()

  const messages = orders.map((order: UIDerivativeOrder) => {
    return MsgBatchCancelDerivativeOrders.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      orders: [
        {
          marketId: order.marketId,
          subaccountId: order.subaccountId,
          orderHash: order.orderHash
        }
      ]
    })
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()
  await appStore.validateGeoIpBasedOnDerivativesAction()

  const priceToFixed = derivativePriceToChainPriceToFixed({
    value: price.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const quantityToFixed = derivativeQuantityToChainQuantityToFixed({
    value: quantity.toFixed()
  })

  const marginToFixed = derivativeMarginToChainMarginToFixed({
    value: margin.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const cw20ConvertMessage = reduceOnly
    ? []
    : prepareOrderMessages({
        amount: marginToFixed,
        denom: market.quoteDenom
      })

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: priceToFixed,
    triggerPrice: '0' /** TODO */,
    quantity: quantityToFixed,
    margin: reduceOnly ? '0' : marginToFixed,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient
  })

  const cancelTpSlMessages = derivativeStore.prepareCancelTpSlOrderMsgs({
    market,
    quantity,
    orderSide
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, ...cancelTpSlMessages, message]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()
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

  const marginToFixed = derivativeMarginToChainMarginToFixed({
    value: margin.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const msgMargin = reduceOnly ? '0' : marginToFixed

  const cw20ConvertMessage = prepareOrderMessages({
    denom: market.quoteDenom,
    amount: marginToFixed
  })

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  const cancelTpSlMessages = derivativeStore.prepareCancelTpSlOrderMsgs({
    market,
    quantity,
    orderSide
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, ...cancelTpSlMessages, message]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()
  await appStore.validateGeoIpBasedOnDerivativesAction()

  const isTpslBuy = ![OrderSide.Buy, OrderSide.BuyPO].includes(orderSide)

  const tpMessage = takeProfit
    ? createTpSlMessage({
        executionPrice: price,
        triggerPrice: takeProfit ?? new BigNumberInBase(0),
        quantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
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
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: isTpslBuy,
        market
      })
    : undefined

  const marginToFixed = derivativeMarginToChainMarginToFixed({
    value: margin.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const cw20ConvertMessage = prepareOrderMessages({
    amount: marginToFixed,
    denom: market.quoteDenom
  })

  const tpSlMessages = [tpMessage, slMessage].filter(
    (msg) => msg
  ) as MsgCreateDerivativeMarketOrder[]

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    orderType: orderSideToOrderType(orderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0' /** TODO */,
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity.toFixed()
    }),
    margin: reduceOnly ? '0' : marginToFixed,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient
  })

  const cancelTpSlMessages = derivativeStore.prepareCancelTpSlOrderMsgs({
    market,
    quantity,
    orderSide
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, ...cancelTpSlMessages, message]
  })

  if (tpSlMessages.length) {
    await sharedWalletStore.broadcastWithFeeDelegation({
      messages: tpSlMessages
    })
  }

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()
  await appStore.validateGeoIpBasedOnDerivativesAction()

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

  const marginToFixed = derivativeMarginToChainMarginToFixed({
    value: margin.toFixed(),
    quoteDecimals: market.quoteToken.decimals
  })

  const message = MsgCreateDerivativeMarketOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: reduceOnly ? '0' : marginToFixed,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: referralStore.feeRecipient,
    triggerPrice: msgTriggerPrice,
    orderType: orderSideToOrderType(orderSide)
  })

  const cw20ConvertMessage = prepareOrderMessages({
    denom: market.quoteDenom,
    amount: marginToFixed
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, message]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })
}

export const submitTpSlOrder = async ({
  position,
  stopLossPrice,
  takeProfitPrice,
  stopLossQuantity,
  takeProfitQuantity
}: {
  position: PositionV2
  stopLossPrice?: BigNumberInBase
  takeProfitPrice?: BigNumberInBase
  stopLossQuantity: BigNumberInBase
  takeProfitQuantity: BigNumberInBase
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()
  await appStore.validateGeoIpBasedOnDerivativesAction()

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

  const tpMessage = takeProfitPrice
    ? createTpSlMessage({
        executionPrice: markPrice,
        triggerPrice: takeProfitPrice ?? new BigNumberInBase(0),
        quantity: takeProfitQuantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
        marketId: market.marketId,
        isBuy: !isTpslBuy,
        market
      })
    : undefined

  const slMessage = stopLossPrice
    ? createTpSlMessage({
        executionPrice: markPrice,
        triggerPrice: stopLossPrice ?? new BigNumberInBase(0),
        quantity: stopLossQuantity,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
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

  await sharedWalletStore.broadcastWithFeeDelegation({ messages: tpSlMessages })

  await fetchBalances()
}

export async function submitChase({
  market,
  order,
  price
}: {
  market: UiDerivativeMarket
  order: DerivativeLimitOrder
  price: BigNumberInBase
}) {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  await walletStore.validateGeo()

  const cancelOrderMsg = MsgCancelDerivativeOrder.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    marketId: order.marketId,
    orderHash: order.orderHash,
    subaccountId: accountStore.subaccountId
  })

  const createDerivativeLimitOrderMsg = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    orderType: orderSideToChaseOrderType(order.orderType as OrderSide),
    price: derivativePriceToChainPriceToFixed({
      value: price.toFixed(),
      quoteDecimals: market.quoteToken.decimals
    }),
    triggerPrice: '0',
    quantity: order.quantity,
    margin: order.margin,
    marketId: order.marketId,
    feeRecipient: referralStore.feeRecipient
  })

  const messages = [cancelOrderMsg, createDerivativeLimitOrderMsg]

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
  await fetchBalances()

  return await true
}

export const prepareCancelTpSlOrderMsgs = ({
  market,
  quantity,
  orderSide
}: {
  orderSide: OrderSide
  quantity: BigNumberInBase
  market: UiDerivativeMarket
}) => {
  const accountStore = useAccountStore()
  const positionStore = usePositionStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const selectedPosition = positionStore.positions.find(
    (position) =>
      position.marketId === market.marketId &&
      position.subaccountId === accountStore.subaccountId
  )

  const shouldAutoCancelTpSlOnLong =
    selectedPosition?.direction === TradeDirection.Long &&
    [
      OrderSide.Sell,
      OrderSide.SellPO,
      OrderSide.TakeSell,
      OrderSide.StopSell
    ].includes(orderSide)

  const shouldAutoCancelTpSlOnShort =
    selectedPosition?.direction === TradeDirection.Short &&
    [
      OrderSide.Buy,
      OrderSide.BuyPO,
      OrderSide.TakeBuy,
      OrderSide.StopBuy
    ].includes(orderSide)

  const shouldAutoCancelTpSl =
    shouldAutoCancelTpSlOnLong || shouldAutoCancelTpSlOnShort

  const msgs = [] as Msgs[]

  if (!shouldAutoCancelTpSl) {
    return msgs
  }

  const availablePositionQuantity = new BigNumberInBase(
    selectedPosition?.quantity || 0
  )

  const remainingQuantity = availablePositionQuantity.minus(quantity)

  const selectedPositionConditionalOrders =
    derivativeStore.subaccountConditionalOrders.filter(
      (order) =>
        order.marketId === market.marketId &&
        order.subaccountId === accountStore.subaccountId
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

  if (
    tpOrder &&
    new BigNumberInBase(remainingQuantity).lt(tpOrder.quantity || 0)
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
    new BigNumberInBase(remainingQuantity).lt(slOrder.quantity || 0)
  ) {
    const cancelSlMessage = MsgCancelDerivativeOrder.fromJSON({
      injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
      marketId: slOrder.marketId,
      orderHash: slOrder.orderHash,
      subaccountId: slOrder.subaccountId
    })

    msgs.push(cancelSlMessage)
  }

  return msgs
}
