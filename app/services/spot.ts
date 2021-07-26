import {
  SpotMarketComposer,
  SpotMarketStreamType,
  SpotTransformer,
  SpotOrderSide,
  OrderbookStreamCallback as SpotMarketOrderbookStreamCallback,
  TradeStreamCallback as SpotMarketTradeStreamCallback,
  OrderStreamCallback as SpotMarketOrderStreamCallback
} from '@injectivelabs/spot-consumer'
import { AccountAddress, TradeExecutionSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import { metricsProvider } from '../providers/MetricsProvider'
import {
  baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData,
  marketsSummaryToUiMarketsSummary
} from '../transformers/spot'
import { streamProvider } from '../providers/StreamProvider'
import { TxProvider } from '~/app/providers/TxProvider'
import { spotMarketStream } from '~/app/singletons/SpotMarketStream'
import {
  FEE_RECIPIENT,
  CHAIN_ID,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '~/app/utils/constants'
import {
  BaseUiSpotMarketWithTokenMetaData,
  UiPriceLevel,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'
import { spotConsumer } from '~/app/singletons/SpotMarketConsumer'
import {
  orderTypeToGrpcOrderType,
  spotMarketToUiSpotMarket,
  spotMarketsToUiSpotMarkets
} from '~/app/transformers/spot'
import { spotChronosConsumer } from '~/app/singletons/SpotMarketChronosConsumer'
import { SpotMetrics } from '~/types/metrics'

export const fetchMarkets = async (): Promise<UiSpotMarket[]> => {
  const promise = spotConsumer.fetchMarkets()
  const markets = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchMarkets
  )

  return spotMarketsToUiSpotMarkets(
    SpotTransformer.grpcMarketsToMarkets(markets)
  )
}

export const fetchMarketSummary = async (
  marketId: string
): Promise<UiSpotMarketSummary> => {
  const promise = spotChronosConsumer.fetchSpotMarketSummary(marketId)
  const marketSummary = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchMarketSummary
  )

  return {
    ...marketSummary,
    marketId
  }
}

export const fetchMarketsSummary = async (
  oldMarketsSummary?: UiSpotMarketSummary[]
): Promise<UiSpotMarketSummary[]> => {
  const promise = spotChronosConsumer.fetchSpotMarketsSummary()
  const marketsSummary = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchMarketsSummary
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
  const promise = spotConsumer.fetchMarket(marketId)
  const market = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchMarket
  )
  const transformedMarket = baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData(
    SpotTransformer.grpcMarketToMarket(market)
  ) as BaseUiSpotMarketWithTokenMetaData

  return spotMarketToUiSpotMarket(transformedMarket)
}

export const fetchMarketOrderbook = async (marketId: string) => {
  const promise = spotConsumer.fetchOrderbook(marketId)
  const orderbook = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchOrderbook
  )

  return SpotTransformer.grpcOrderbookToOrderbook(orderbook)
}

export const fetchMarketTrades = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  const promise = spotConsumer.fetchTrades({
    marketId,
    subaccountId,
    // For market wide trades we get only `executionSide=Taker` trades
    executionSide: subaccountId ? undefined : TradeExecutionSide.Taker
  })
  const trades = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchTrades
  )

  return SpotTransformer.grpcTradesToTrades(trades)
}

export const fetchMarketOrders = async ({
  marketId,
  orderSide,
  subaccountId
}: {
  marketId: string
  orderSide?: SpotOrderSide
  subaccountId: AccountAddress
}) => {
  const promise = spotConsumer.fetchOrders({
    marketId,
    subaccountId,
    orderSide
  })
  const orders = await metricsProvider.sendAndRecord(
    promise,
    SpotMetrics.FetchOrders
  )

  return SpotTransformer.grpcOrdersToOrders(orders)
}

export const streamOrderbook = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotMarketOrderbookStreamCallback
}) => {
  const streamFn = spotMarketStream.orderbook.start.bind(
    spotMarketStream.orderbook
  )
  const streamFnArgs = {
    marketId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.Orderbook
  })
}

export const streamTrades = ({
  marketId,
  callback
}: {
  marketId: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.start.bind(spotMarketStream.trades)
  const streamFnArgs = {
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.Trades
  })
}

export const streamSubaccountTrades = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: SpotMarketTradeStreamCallback
}) => {
  const streamFn = spotMarketStream.trades.subaccount.bind(
    spotMarketStream.trades
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountTrades
  })
}

export const streamSubaccountOrders = ({
  marketId,
  subaccountId,
  callback
}: {
  marketId: string
  subaccountId: string
  callback: SpotMarketOrderStreamCallback
}) => {
  const streamFn = spotMarketStream.orders.subaccount.bind(
    spotMarketStream.orders
  )
  const streamFnArgs = {
    marketId,
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SpotMarketStreamType.SubaccountOrders
  })
}

export const cancelMarketStreams = () => {
  streamProvider.cancel(SpotMarketStreamType.Orderbook)
  streamProvider.cancel(SpotMarketStreamType.SubaccountOrders)
  streamProvider.cancel(SpotMarketStreamType.SubaccountTrades)
  streamProvider.cancel(SpotMarketStreamType.Trades)
  streamProvider.cancel(SubaccountStreamType.Balances)
}

export const submitLimitOrder = async ({
  price,
  quantity,
  orderType,
  address,
  market,
  injectiveAddress,
  subaccountId
}: {
  price: BigNumberInBase
  quantity: BigNumberInBase
  orderType: SpotOrderSide
  subaccountId: string
  market: UiSpotMarket
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const relativePrice = price.toWei(
    market.quoteToken.decimals - market.baseToken.decimals
  )
  const relativeQuantity = quantity.toWei(market.baseToken.decimals)

  const message = SpotMarketComposer.createLimitOrder({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    order: {
      orderType: orderTypeToGrpcOrderType(orderType),
      price: relativePrice.toFixed(),
      quantity: relativeQuantity.toFixed(),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: ZERO_TO_STRING // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: SpotMetrics.CreateLimitOrder,
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
  orderType,
  address,
  market,
  injectiveAddress,
  subaccountId
}: {
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: SpotOrderSide
  subaccountId: string
  market: UiSpotMarket
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const relativePrice = price.toWei(
    market.quoteToken.decimals - market.baseToken.decimals
  )
  const relativeQuantity = quantity.toWei(market.baseToken.decimals)
  const message = SpotMarketComposer.createMarketOrder({
    subaccountId,
    injectiveAddress,
    marketId: market.marketId,
    order: {
      price: relativePrice.toFixed(),
      orderType: orderTypeToGrpcOrderType(orderType),
      quantity: relativeQuantity.toFixed(),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: ZERO_TO_STRING // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: SpotMetrics.CreateMarketOrder,
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
  const message = SpotMarketComposer.batchCancelSpotOrder({
    injectiveAddress,
    orders
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: SpotMetrics.BatchCancelLimitOrders,
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
  const message = SpotMarketComposer.cancelSpotOrder({
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
      bucket: SpotMetrics.CancelLimitOrder,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const calculateWorstExecutionPriceFromOrderbook = ({
  records,
  market,
  amount
}: {
  records: UiPriceLevel[]
  market: UiSpotMarket
  amount: BigNumberInBase
}): BigNumberInBase => {
  let remainAmountToFill = amount
  let worstPrice = ZERO_IN_BASE

  for (const record of records) {
    const orderQuantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )
    const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
    remainAmountToFill = remainAmountToFill.minus(min)

    if (remainAmountToFill.lte(0)) {
      return new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    } else {
      worstPrice = new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
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
  market: UiSpotMarket
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const orderQuantity = new BigNumberInWei(order.quantity).toBase(
        market.baseToken.decimals
      )
      const min = BigNumberInBase.min(remainAmountToFill, orderQuantity)
      const price = new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
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
  balance,
  market,
  slippage,
  percent = 1
}: {
  records: UiPriceLevel[]
  balance: BigNumberInBase
  percent?: number
  slippage: number
  market: UiSpotMarket
}) => {
  const fee = new BigNumberInBase(market.takerFeeRate)
  const availableBalance = balance.times(percent)
  let totalQuantity = ZERO_IN_BASE
  let totalNotional = ZERO_IN_BASE

  for (const record of records) {
    const price = new BigNumberInBase(record.price)
      .times(slippage)
      .toWei(market.baseToken.decimals - market.quoteToken.decimals)
    const quantity = new BigNumberInWei(record.quantity).toBase(
      market.baseToken.decimals
    )

    totalQuantity = totalQuantity.plus(quantity)
    totalNotional = totalQuantity.times(price)

    const totalFees = totalNotional.times(fee)
    const total = totalNotional.plus(totalFees)

    if (total.gt(availableBalance)) {
      return availableBalance.dividedBy(fee.plus(1).times(price))
    }
  }

  return totalQuantity
}
