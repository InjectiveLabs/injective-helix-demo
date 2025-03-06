import {
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
import { FEE_RECIPIENT } from '@/app/utils/constants'
import { backupPromiseCall } from '@/app/utils/async'
import { prepareOrderMessages } from '@/app/utils/market'
import { orderSideToChaseOrderType } from '@/app/utils/trade'
import { getDerivativeOrderTypeToSubmit } from '@/app/utils/helpers'
import { UIDerivativeOrder, UiDerivativeMarket } from '@/types'

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
  const sharedWalletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

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

  const cw20ConvertMessage = prepareOrderMessages({
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
    feeRecipient: FEE_RECIPIENT
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, message]
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
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

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

  const message = MsgCreateDerivativeLimitOrder.fromJSON({
    subaccountId: accountStore.subaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    price: msgPrice,
    margin: msgMargin,
    quantity: msgQuantity,
    marketId: market.marketId,
    feeRecipient: FEE_RECIPIENT,
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
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

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
    feeRecipient: FEE_RECIPIENT
  })

  const cw20ConvertMessage = prepareOrderMessages({
    amount: marginToFixed,
    denom: market.quoteDenom
  })

  const tpSlMessages = [tpMessage, slMessage].filter(
    (msg) => msg
  ) as MsgCreateDerivativeMarketOrder[]

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, message]
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
  const sharedWalletStore = useSharedWalletStore()

  if (
    !market ||
    !accountStore.subaccountId ||
    !sharedWalletStore.isUserConnected
  ) {
    return
  }

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
    feeRecipient: FEE_RECIPIENT,
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
  stopLoss,
  takeProfit
}: {
  position: PositionV2
  takeProfit?: BigNumberInBase
  stopLoss?: BigNumberInBase
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

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

  const tpMessage = takeProfit
    ? createTpSlMessage({
        executionPrice: markPrice,
        triggerPrice: takeProfit ?? new BigNumberInBase(0),
        quantity: new BigNumberInBase(position.quantity),
        subaccountId: accountStore.subaccountId,
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
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
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

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
    feeRecipient: FEE_RECIPIENT
  })

  const messages = [cancelOrderMsg, createDerivativeLimitOrderMsg]

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
  await fetchBalances()

  return await true
}
