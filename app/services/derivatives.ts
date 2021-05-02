import {
  DerivativeMarketComposer,
  DerivativeMarketStreamType,
  DerivativeOrderType,
  OrderbookStreamCallback as DerivativeMarketOrderbookStreamCallback,
  TradeStreamCallback as DerivativeMarketTradeStreamCallback,
  OrderStreamCallback as DerivativeMarketOrderStreamCallback,
  DerivativeTransformer
} from '@injectivelabs/derivatives-consumer'
import { AccountAddress, TradeExecutionSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
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
  const stream = derivativeMarketStream.orders.subaccount({
    marketId,
    subaccountId,
    callback
  })

  streamManager.set(stream, DerivativeMarketStreamType.SubaccountOrders)
}

export const cancelMarketStreams = () => {
  streamManager.cancelIfExists(DerivativeMarketStreamType.Orderbook)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountOrders)
  streamManager.cancelIfExists(DerivativeMarketStreamType.SubaccountTrades)
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
      quantity: quantity.toWei().toFixed(),
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
      quantity: quantity.toWei().toFixed(),
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
      const price = new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(market.quoteToken.decimals)
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
