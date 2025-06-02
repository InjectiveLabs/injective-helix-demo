import { sharedBackupPromiseCall } from '@shared/utils/async'
import { orderSideToOrderType } from '@shared/transformer/trade'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  MsgCancelDerivativeOrder,
  MsgCreateDerivativeLimitOrder,
  MsgCreateDerivativeMarketOrder,
  MsgBatchCancelDerivativeOrders,
  derivativePriceToChainPriceToFixed,
  derivativeMarginToChainMarginToFixed,
  derivativeQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { orderSideToChaseOrderType } from '@/app/utils/trade'
import { prepareNeptuneWithdrawMessage } from '@/app/utils/msgs'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import { ConditionalOrderSide } from '@/types'
import type { UIDerivativeOrder, UiDerivativeMarket } from '@/types'
import type {
  Msgs,
  PositionV2,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()

  return sharedBackupPromiseCall(() =>
    Promise.all([
      derivativeStore.fetchSubaccountOrders(),
      accountStore.fetchAccountPortfolioBalances(),
      ...(shouldFetchCw20Balances ? [accountStore.fetchCw20Balances()] : [])
    ])
  )
}

const createTpSlMessage = ({
  isBuy,
  market,
  quantity,
  marketId,
  triggerPrice,
  subaccountId,
  executionPrice,
  injectiveAddress
}: {
  isBuy: boolean
  marketId: string
  subaccountId: string
  injectiveAddress: string
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  triggerPrice: BigNumberInBase
  executionPrice: BigNumberInBase
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

  const market = derivativeStore.marketByIdOrSlug(order.marketId)

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

  sharedBackupPromiseCall(() =>
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
  orderSide: OrderSide
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
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

  const cw20Messages = reduceOnly
    ? []
    : prepareNeptuneWithdrawMessage({
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

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [
      ...cw20Messages,
      ...derivativeStore.prepareCancelTpSlOrderMsgs({
        market,
        quantity,
        orderSide
      }),
      message
    ]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
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
  orderSide: OrderSide
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  triggerPrice: BigNumberInBase
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

  const cw20Messages = prepareNeptuneWithdrawMessage({
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

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [
      ...cw20Messages,
      ...derivativeStore.prepareCancelTpSlOrderMsgs({
        market,
        quantity,
        orderSide
      }),
      message
    ]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
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
  orderSide: OrderSide
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  stopLoss?: BigNumberInBase
  takeProfit?: BigNumberInBase
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

  const cw20Messages = prepareNeptuneWithdrawMessage({
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

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [
      ...cw20Messages,
      ...derivativeStore.prepareCancelTpSlOrderMsgs({
        market,
        quantity,
        orderSide
      }),
      message
    ]
  })

  if (tpSlMessages.length) {
    await sharedWalletStore.broadcastWithFeeDelegation({
      messages: tpSlMessages
    })
  }

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
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
  orderSide: OrderSide
  price: BigNumberInBase
  margin: BigNumberInBase
  quantity: BigNumberInBase
  market: UiDerivativeMarket
  triggerPrice: BigNumberInBase
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

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: market.quoteDenom,
    amount: marginToFixed
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20Messages, message]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
  })
}

export const submitTpSlOrder = async ({
  position,
  stopLossPrice,
  takeProfitPrice,
  existingTpOrder,
  existingSlOrder,
  stopLossQuantity,
  takeProfitQuantity
}: {
  position: PositionV2
  stopLossPrice?: BigNumberInBase
  takeProfitPrice?: BigNumberInBase
  stopLossQuantity: BigNumberInBase
  takeProfitQuantity: BigNumberInBase
  existingTpOrder?: DerivativeLimitOrder
  existingSlOrder?: DerivativeLimitOrder
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

  const market = derivativeStore.marketByIdOrSlug(position.marketId)

  if (!market) {
    return
  }

  const isTpslBuy = position.direction === TradeDirection.Long

  const markPrice = new BigNumberInWei(position.markPrice).toBase(
    market.quoteToken.decimals
  )

  const tpSlMessages = [] as Msgs[]
  const cancelMessages = [] as Msgs[]

  const tpHasChange =
    !takeProfitQuantity.eq(existingTpOrder?.quantity || 0) ||
    !new BigNumberInBase(existingTpOrder?.triggerPrice || 0).eq(
      derivativePriceToChainPriceToFixed({
        value: takeProfitPrice?.toFixed() || 0,
        quoteDecimals: market.quoteToken.decimals
      })
    )

  const slHasChange =
    !stopLossQuantity.eq(existingSlOrder?.quantity || 0) ||
    !new BigNumberInBase(existingSlOrder?.triggerPrice || 0).eq(
      derivativePriceToChainPriceToFixed({
        value: stopLossPrice?.toFixed() || 0,
        quoteDecimals: market.quoteToken.decimals
      })
    )

  const shouldCreateTpOrder = takeProfitPrice && tpHasChange

  const shouldCreateSlOrder = stopLossPrice && slHasChange

  if (existingTpOrder && shouldCreateTpOrder) {
    cancelMessages.push(
      MsgCancelDerivativeOrder.fromJSON({
        marketId: existingTpOrder.marketId,
        orderHash: existingTpOrder.orderHash,
        subaccountId: existingTpOrder.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress
      })
    )
  }

  if (shouldCreateTpOrder) {
    tpSlMessages.push(
      createTpSlMessage({
        market,
        isBuy: !isTpslBuy,
        executionPrice: markPrice,
        marketId: market.marketId,
        quantity: takeProfitQuantity,
        triggerPrice: takeProfitPrice,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress
      })
    )
  }

  if (existingSlOrder && shouldCreateSlOrder) {
    cancelMessages.push(
      MsgCancelDerivativeOrder.fromJSON({
        marketId: existingSlOrder.marketId,
        orderHash: existingSlOrder.orderHash,
        subaccountId: existingSlOrder.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress
      })
    )
  }

  if (shouldCreateSlOrder) {
    tpSlMessages.push(
      createTpSlMessage({
        market,
        isBuy: !isTpslBuy,
        executionPrice: markPrice,
        marketId: market.marketId,
        quantity: stopLossQuantity,
        triggerPrice: stopLossPrice,
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress
      })
    )
  }

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: cancelMessages.concat(tpSlMessages)
  })

  await fetchBalances()

  sharedBackupPromiseCall(() =>
    Promise.all([derivativeStore.fetchSubaccountConditionalOrders()])
  )
}

export async function submitChase({
  price,
  order,
  market
}: {
  price: BigNumberInBase
  market: UiDerivativeMarket
  order: DerivativeLimitOrder
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
    quantity: order.unfilledQuantity,
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
