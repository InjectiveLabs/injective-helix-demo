import {
  DerivativeMarketComposer,
  DerivativeMarketStreamType,
  DerivativeOrderSide,
  OrderbookStreamCallback as DerivativeMarketOrderbookStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  PositionStreamCallback as DerivativeMarketPositionStreamCallback,
  DerivativeTransformer
} from '@injectivelabs/derivatives-consumer'
import { AccountAddress, TradeExecutionSide } from '@injectivelabs/ts-types'
import {
  BigNumberInBase,
  BigNumberInWei,
  DEFAULT_EXCHANGE_LIMIT
} from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import {
  OracleStreamType,
  PricesStreamCallback
} from '@injectivelabs/exchange-consumer'
import { oracleStream } from '../singletons/OracleStream'
import { oracleConsumer } from '../singletons/OracleConsumer'
import { metricsProvider } from '../providers/MetricsProvider'
import { TxProvider } from '~/app/providers/TxProvider'
import { derivativeMarketStream } from '~/app/singletons/DerivativeMarketStream'
import { streamManager } from '~/app/singletons/StreamManager'
import {
  FEE_RECIPIENT,
  CHAIN_ID,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '~/app/utils/constants'
import {
  UiPriceLevel,
  UiDerivativeMarket,
  BaseUiDerivativeMarket,
  UiDerivativeMarketSummary
} from '~/types'
import { derivativeConsumer } from '~/app/singletons/DerivativeMarketConsumer'
import {
  orderTypeToGrpcOrderType,
  derivativeMarketToUiDerivativeMarket,
  derivativeMarketsToUiDerivativeMarkets,
  marketsSummaryToUiMarketsSummary
} from '~/app/transformers/derivatives'
import { derivativeChronosConsumer } from '~/app/singletons/DerivativeMarketChronosConsumer'
import { DerivativesMetrics } from '~/types/metrics'

export const fetchMarkets = async (): Promise<UiDerivativeMarket[]> => {
  const promise = derivativeConsumer.fetchMarkets()
  const markets = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchMarkets
  )

  const transformedMarkets = DerivativeTransformer.grpcMarketsToMarkets(markets)
  const quoteTokenMetaDataExist = (m: BaseUiDerivativeMarket) =>
    m.quoteToken !== undefined
  const filteredMarkets = transformedMarkets.filter(quoteTokenMetaDataExist)

  return derivativeMarketsToUiDerivativeMarkets(filteredMarkets)
}

export const fetchMarketSummary = async (
  marketId: string
): Promise<UiDerivativeMarketSummary> => {
  const promise = derivativeChronosConsumer.fetchDerivativeMarketSummary(
    marketId
  )
  const marketSummary = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchMarketSummary
  )

  return {
    ...marketSummary,
    marketId
  }
}

export const fetchMarketsSummary = async (
  oldMarketsSummary?: UiDerivativeMarketSummary[]
): Promise<UiDerivativeMarketSummary[]> => {
  const promise = derivativeChronosConsumer.fetchDerivativeMarketsSummary()
  const marketsSummary = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchMarketsSummary
  )

  if (!oldMarketsSummary) {
    return marketsSummary
  }

  const marketsWithOldSummaries = oldMarketsSummary.filter((market) =>
    marketsSummary.find((m) => m.marketId === market.marketId)
  )

  return marketsSummaryToUiMarketsSummary(
    marketsWithOldSummaries,
    marketsSummary
  )
}

export const fetchMarket = async (marketId: string) => {
  const promise = derivativeConsumer.fetchMarket(marketId)
  const market = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchMarket
  )
  const transformedMarket = DerivativeTransformer.grpcMarketToMarket(market)

  return derivativeMarketToUiDerivativeMarket(transformedMarket)
}

export const fetchMarketOrderbook = async (marketId: string) => {
  const promise = derivativeConsumer.fetchOrderbook(marketId)
  const orderbook = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchOrderbook
  )

  return DerivativeTransformer.grpcOrderbookToOrderbook(orderbook)
}

export const fetchMarketTrades = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  const promise = derivativeConsumer.fetchTrades({
    marketId,
    subaccountId,
    // For market wide trades we get only `executionSide=Taker` trades
    executionSide: subaccountId ? undefined : TradeExecutionSide.Taker
  })
  const trades = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchTrades
  )

  return DerivativeTransformer.grpcTradesToTrades(trades)
}

export const fetchMarketPositions = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  const promise = derivativeConsumer.fetchPositions({
    marketId,
    subaccountId
  })
  const positions = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchPositions
  )

  return DerivativeTransformer.grpcPositionsToPositions(positions)
}

export const fetchMarketOrders = async ({
  marketId,
  subaccountId,
  orderSide
}: {
  marketId: string
  orderSide?: DerivativeOrderSide
  subaccountId: AccountAddress
}) => {
  const promise = derivativeConsumer.fetchOrders({
    marketId,
    orderSide,
    subaccountId
  })
  const orders = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchOrders
  )

  return DerivativeTransformer.grpcOrdersToOrders(orders)
}

export const fetchMarketMarkPrice = async (market: UiDerivativeMarket) => {
  const promise = oracleConsumer.price({
    baseSymbol: market.oracleBase,
    quoteSymbol: market.oracleQuote,
    oracleType: market.oracleType
  })
  const price = await metricsProvider.sendAndRecord(
    promise,
    DerivativesMetrics.FetchOrders
  )

  return price || ZERO_TO_STRING
}

export const streamOrderbook = ({
  marketId,
  callback,
  onEndCallback
}: {
  marketId: string
  callback: DerivativeMarketOrderbookStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(DerivativeMarketStreamType.Orderbook)) {
    return
  }

  const stream = derivativeMarketStream.orderbook.start({
    marketId,
    callback,
    onEndCallback: () => {
      streamManager.cancelIfExists(DerivativeMarketStreamType.Orderbook)
      onEndCallback()
    }
  })

  streamManager.set(stream, DerivativeMarketStreamType.Orderbook)
}

export const streamTrades = ({
  marketId,
  callback,
  onEndCallback
}: {
  marketId: string
  callback: DerivativeMarketTradeStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(DerivativeMarketStreamType.Trades)) {
    return
  }

  const stream = derivativeMarketStream.trades.start({
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker,
    onEndCallback: () => {
      streamManager.cancelIfExists(DerivativeMarketStreamType.Trades)
      onEndCallback()
    }
  })

  streamManager.set(stream, DerivativeMarketStreamType.Trades)
}

export const streamSubaccountTrades = ({
  marketId,
  subaccountId,
  callback,
  onEndCallback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketTradeStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountTrades)) {
    return
  }

  const stream = derivativeMarketStream.trades.subaccount({
    marketId,
    subaccountId,
    callback,
    onEndCallback: () => {
      streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountTrades)
      onEndCallback()
    }
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountTrades)
}

export const streamSubaccountOrders = ({
  marketId,
  subaccountId,
  callback,
  onEndCallback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketOrderStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountOrders)) {
    return
  }

  const stream = derivativeMarketStream.orders.subaccount({
    marketId,
    subaccountId,
    callback,
    onEndCallback: () => {
      streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountOrders)
      onEndCallback()
    }
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountOrders)
}

export const streamSubaccountPositions = ({
  marketId,
  subaccountId,
  callback,
  onEndCallback
}: {
  marketId: string
  subaccountId: string
  callback: DerivativeMarketPositionStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountPositions)) {
    return
  }

  const stream = derivativeMarketStream.positions.subaccount({
    marketId,
    subaccountId,
    callback,
    onEndCallback: () => {
      streamManager.cancelIfExists(
        DerivativeMarketStreamType.SubaccountPositions
      )
      onEndCallback()
    }
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountPositions)
}

export const streamMarketMarkPrice = ({
  market,
  callback,
  onEndCallback
}: {
  market: UiDerivativeMarket
  callback: PricesStreamCallback
  onEndCallback: () => void
}) => {
  if (streamManager.exists(OracleStreamType.Prices)) {
    return
  }

  const stream = oracleStream.prices.start({
    oracleType: market.oracleType,
    baseSymbol: market.oracleBase,
    quoteSymbol: market.oracleQuote,
    callback,
    onEndCallback: () => {
      streamManager.cancelIfExists(OracleStreamType.Prices)
      onEndCallback()
    }
  })

  streamManager.set(stream, OracleStreamType.Prices)
}

export const cancelMarketStreams = () => {
  streamManager.cancelIfExists(DerivativeMarketStreamType.Orderbook)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountOrders)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountTrades)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountPositions)
  streamManager.cancelIfExists(DerivativeMarketStreamType.Trades)
  streamManager.cancelIfExists(SubaccountStreamType.Balances)
  streamManager.cancelIfExists(OracleStreamType.Prices)
}

export const submitLimitOrder = async ({
  price,
  quantity,
  orderType,
  address,
  market,
  reduceOnly,
  margin,
  injectiveAddress,
  subaccountId
}: {
  margin: BigNumberInBase
  price: BigNumberInBase
  reduceOnly: boolean
  quantity: BigNumberInBase
  orderType: DerivativeOrderSide
  subaccountId: string
  market: UiDerivativeMarket
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = DerivativeMarketComposer.createLimitOrder({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    order: {
      orderType: orderTypeToGrpcOrderType(orderType),
      price: price.toWei(market.quoteToken.decimals).toFixed(),
      margin: reduceOnly
        ? ZERO_TO_STRING
        : margin.toWei(market.quoteToken.decimals).toFixed(),
      quantity: quantity.toFixed(),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: ZERO_TO_STRING // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: DerivativesMetrics.CreateLimitOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const submitMarketOrder = async ({
  quantity,
  price,
  reduceOnly,
  orderType,
  address,
  market,
  margin,
  injectiveAddress,
  subaccountId
}: {
  margin: BigNumberInBase
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: DerivativeOrderSide
  subaccountId: string
  reduceOnly: boolean
  market: UiDerivativeMarket
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = DerivativeMarketComposer.createMarketOrder({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    order: {
      price: price.toWei(market.quoteToken.decimals).toFixed(),
      margin: reduceOnly
        ? ZERO_TO_STRING
        : margin.toWei(market.quoteToken.decimals).toFixed(),
      quantity: quantity.toFixed(),
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: ZERO_TO_STRING // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: DerivativesMetrics.CreateMarketOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const closePosition = async ({
  quantity,
  price,
  orderType,
  address,
  market,
  injectiveAddress,
  subaccountId
}: {
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: DerivativeOrderSide
  subaccountId: string
  market: UiDerivativeMarket
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = DerivativeMarketComposer.createMarketOrder({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    order: {
      price: new BigNumberInBase(price.toFixed(market.priceDecimals))
        .toWei(market.quoteToken.decimals)
        .toFixed(),
      margin: ZERO_TO_STRING,
      quantity: quantity.toFixed(),
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: ZERO_TO_STRING // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: DerivativesMetrics.CreateMarketOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const cancelOrder = async ({
  orderHash,
  address,
  marketId,
  injectiveAddress,
  subaccountId
}: {
  orderHash: string
  subaccountId: string
  marketId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = DerivativeMarketComposer.cancelDerivativeOrder({
    subaccountId,
    marketId,
    injectiveAddress,
    order: {
      orderHash
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: DerivativesMetrics.CancelLimitOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const batchCancelOrders = async ({
  orders,
  address,
  injectiveAddress
}: {
  orders: {
    subaccountId: string
    marketId: string
    orderHash: string
  }[]
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const message = DerivativeMarketComposer.batchCancelDerivativeOrder({
    injectiveAddress,
    orders
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      gasLimit: new BigNumberInBase(DEFAULT_EXCHANGE_LIMIT)
        .dividedBy(
          3 /* Assuming we can only process 3 order cancellations with the current gas limit */
        )
        .times(orders.length)
        .toNumber(),
      bucket: DerivativesMetrics.BatchCancelLimitOrders,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const calculateMargin = ({
  quantity,
  price,
  leverage
}: {
  quantity: string
  price: string
  leverage: string
}): BigNumberInBase => {
  return new BigNumberInBase(quantity).times(price).dividedBy(leverage)
}

export const calculateLiquidationPrice = ({
  price,
  quantity,
  margin,
  orderType,
  market: { maintenanceMarginRatio }
}: {
  price: string
  quantity: string
  margin: string
  orderType: DerivativeOrderSide
  market: UiDerivativeMarket
}): BigNumberInBase => {
  if (!price || !quantity || !margin) {
    return ZERO_IN_BASE
  }

  const isOrderTypeBuy = orderType === DerivativeOrderSide.Buy

  const numerator = isOrderTypeBuy
    ? new BigNumberInBase(margin).minus(
        new BigNumberInBase(price).times(quantity)
      )
    : new BigNumberInBase(margin).plus(
        new BigNumberInBase(price).times(quantity)
      )

  const maintenanceMarginRatioFactor = isOrderTypeBuy
    ? new BigNumberInBase(maintenanceMarginRatio).minus(1)
    : new BigNumberInBase(maintenanceMarginRatio)

  const denominator = isOrderTypeBuy
    ? maintenanceMarginRatioFactor.times(quantity)
    : maintenanceMarginRatioFactor.times(quantity).plus(quantity)

  const liquidationPrice = numerator.dividedBy(denominator)

  return liquidationPrice.gte(0) ? liquidationPrice : ZERO_IN_BASE
}

export const calculateWorstExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarket
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity)
    const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
    remainAmountToFill = remainAmountToFill.minus(min)

    if (remainAmountToFill.lte(0)) {
      return new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
    } else {
      worstPrice = new BigNumberInWei(record.price).toBase(
        market.quoteToken.decimals
      )
    }
  }

  return worstPrice
}

export const calculateAverageExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiDerivativeMarket
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const min = BigNumberInBase.min(remainAmountToFill, order.quantity)
      const price = new BigNumberInWei(order.price).toBase(
        market.quoteToken.decimals
      )

      return {
        sum: sum.plus(price.times(min)),
        remainAmountToFill: remainAmountToFill.minus(min)
      }
    },
    { sum: ZERO_IN_BASE, remainAmountToFill: amount }
  )

  return sum.div(amount.minus(remainAmountToFill))
}

export const getApproxAmountForMarketOrder = ({
  records,
  margin,
  market,
  slippage,
  leverage = '1',
  percent = 1
}: {
  records: UiPriceLevel[]
  margin: BigNumberInBase
  percent?: number
  slippage: number
  leverage: string
  market: UiDerivativeMarket
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableMargin = new BigNumberInBase(margin).times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional = ZERO_IN_BASE

  for (const record of records) {
    const price = new BigNumberInBase(
      new BigNumberInWei(record.price)
        .times(slippage)
        .toBase(market.quoteToken.decimals)
    )
    const quantity = new BigNumberInBase(
      new BigNumberInBase(record.quantity).dp(market.quantityDecimals)
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = new BigNumberInWei(totalNotional.times(fee))
    const totalMargin = calculateMargin({
      quantity: totalQuantity.toFixed(),
      price: price.toFixed(),
      leverage
    })
    const total = totalMargin.plus(totalFees)

    if (total.gt(availableMargin)) {
      return availableMargin
        .times(leverage)
        .dividedBy(fee.times(leverage).plus(1).times(price))
    }
  }

  return totalQuantity
}
