import {
  DerivativeMarketComposer,
  DerivativeMarketStreamType,
  DerivativeOrderType,
  OrderbookStreamCallback as DerivativeMarketOrderbookStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  PositionStreamCallback as DerivativeMarketPositionStreamCallback,
  DerivativeTransformer
} from '@injectivelabs/derivatives-consumer'
import { AccountAddress, TradeExecutionSide } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { SubaccountStreamType } from '@injectivelabs/subaccount-consumer'
import { TxProvider } from '~/app/providers/TxProvider'
import { derivativeMarketStream } from '~/app/singletons/DerivativeMarketStream'
import { streamManager } from '~/app/singletons/StreamManager'
import {
  FEE_RECIPIENT,
  TESTNET_CHAIN_ID,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { UiPriceLevel, UiDerivativeMarket } from '~/types'
import { derivativeConsumer } from '~/app/singletons/DerivativeMarketConsumer'
import {
  orderTypeToGrpcOrderType,
  derivativeMarketToUiDerivativeMarket
} from '~/app/transformers/derivatives'
import { derivativeChronosConsumer } from '~/app/singletons/DerivativeMarketChronosConsumer'

const dummyMarketSummaries = [
  {
    change: 0,
    high: 0,
    low: 0,
    open: 0,
    price: 0,
    volume: 0,
    marketId:
      '0x7cc8b10d7deb61e744ef83bdec2bbcf4a056867e89b062c6a453020ca82bd4e4'
  },
  {
    change: 0,
    high: 0,
    low: 0,
    open: 0,
    price: 0,
    volume: 0,
    marketId:
      '0x883017f185381e33e02b5def170a4a451a1cd2e866f7bd480b54e13b929f1be9'
  }
]

export const fetchMarkets = async (): Promise<UiDerivativeMarket[]> => {
  const markets = DerivativeTransformer.grpcMarketsToMarkets(
    await derivativeConsumer.fetchMarkets()
  )
  // const marketsSummary = await derivativeChronosConsumer.fetchDerivativeMarketsSummary()
  const marketsSummary = dummyMarketSummaries
  const marketWithSummaries = markets.filter((market) =>
    marketsSummary.find((m) => m.marketId === market.marketId)
  )

  return marketWithSummaries.map((market) => {
    const marketSummary = marketsSummary.find(
      (m) => m.marketId === market.marketId
    )!

    return derivativeMarketToUiDerivativeMarket(market, marketSummary)
  })
}

export const fetchMarket = async (marketId: string) => {
  const market = DerivativeTransformer.grpcMarketToMarket(
    await derivativeConsumer.fetchMarket(marketId)
  )
  const marketSummary = await derivativeChronosConsumer.fetchDerivativeMarketSummary(
    marketId
  )

  return derivativeMarketToUiDerivativeMarket(market, marketSummary)
}

export const fetchMarketOrderbook = async (marketId: string) => {
  return DerivativeTransformer.grpcOrderbookToOrderbook(
    await derivativeConsumer.fetchOrderbook(marketId)
  )
}

export const fetchMarketTrades = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  return DerivativeTransformer.grpcTradesToTrades(
    await derivativeConsumer.fetchTrades({
      marketId,
      subaccountId,
      executionSide: TradeExecutionSide.Taker
    })
  )
}

export const fetchMarketPositions = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  return DerivativeTransformer.grpcPositionsToPositions(
    await derivativeConsumer.fetchPositions({
      marketId,
      subaccountId
    })
  )
}

export const fetchMarketOrders = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId: AccountAddress
}) => {
  return DerivativeTransformer.grpcOrdersToOrders(
    await derivativeConsumer.fetchOrders({
      marketId,
      subaccountId
    })
  )
}

export const streamOrderbook = (
  marketId: string,
  callback: DerivativeMarketOrderbookStreamCallback
) => {
  if (streamManager.exists(DerivativeMarketStreamType.Orderbook)) {
    return
  }

  const stream = derivativeMarketStream.orderbook.start({
    marketId,
    callback
  })

  streamManager.set(stream, DerivativeMarketStreamType.Orderbook)
}

export const streamTrades = (
  marketId: string,
  callback: DerivativeMarketTradeStreamCallback
) => {
  if (streamManager.exists(DerivativeMarketStreamType.Trades)) {
    return
  }

  const stream = derivativeMarketStream.trades.start({
    marketId,
    callback,
    executionSide: TradeExecutionSide.Taker
  })

  streamManager.set(stream, DerivativeMarketStreamType.Trades)
}

export const streamSubaccountTrades = (
  marketId: string,
  subaccountId: string,
  callback: DerivativeMarketTradeStreamCallback
) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountTrades)) {
    return
  }

  const stream = derivativeMarketStream.trades.subaccount({
    marketId,
    subaccountId,
    executionSide: TradeExecutionSide.Taker,
    callback
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountTrades)
}

export const streamSubaccountOrders = (
  marketId: string,
  subaccountId: string,
  callback: DerivativeMarketOrderStreamCallback
) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountOrders)) {
    return
  }

  const stream = derivativeMarketStream.orders.subaccount({
    marketId,
    subaccountId,
    callback
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountOrders)
}

export const streamSubaccountPositions = (
  marketId: string,
  subaccountId: string,
  callback: DerivativeMarketPositionStreamCallback
) => {
  if (streamManager.exists(DerivativeMarketStreamType.SubaccountPositions)) {
    return
  }

  const stream = derivativeMarketStream.positions.subaccount({
    marketId,
    subaccountId,
    callback
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountPositions)
}

export const cancelMarketStreams = () => {
  streamManager.cancelIfExists(DerivativeMarketStreamType.Orderbook)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountOrders)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountTrades)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountPositions)
  streamManager.cancelIfExists(DerivativeMarketStreamType.Trades)
  streamManager.cancelIfExists(SubaccountStreamType.Balances)
}

export const submitLimitOrder = async ({
  price,
  quantity,
  orderType,
  address,
  market,
  margin,
  injectiveAddress,
  subaccountId
}: {
  margin: BigNumberInBase
  price: BigNumberInBase
  quantity: BigNumberInBase
  orderType: DerivativeOrderType
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
      margin: margin.toWei(market.quoteToken.decimals).toFixed(),
      quantity: quantity.toFixed(),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: '0' // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      chainId: TESTNET_CHAIN_ID
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
  margin,
  injectiveAddress,
  subaccountId
}: {
  margin: BigNumberInBase
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: DerivativeOrderType
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
      price: price.toWei(market.quoteToken.decimals).toFixed(),
      margin: margin.toWei(market.quoteToken.decimals).toFixed(),
      quantity: quantity.toFixed(),
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: '0' // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      chainId: TESTNET_CHAIN_ID
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
  orderType: DerivativeOrderType
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
      price: price.toWei(market.quoteToken.decimals).toFixed(),
      margin: ZERO_IN_BASE.toWei(market.quoteToken.decimals).toFixed(),
      quantity: quantity.toFixed(),
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: '0' // TODO
    }
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      chainId: TESTNET_CHAIN_ID
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
      chainId: TESTNET_CHAIN_ID
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
  orderType: DerivativeOrderType
  market: UiDerivativeMarket
}): BigNumberInBase => {
  if (!price || !quantity || !margin) {
    return ZERO_IN_BASE
  }

  const isOrderTypeBuy = orderType === DerivativeOrderType.Buy

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

export const calculateExecutionPriceFromOrderbook = ({
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
