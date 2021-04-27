import {
  SpotMarketComposer,
  SpotMarketStreamType,
  SpotMarketTransformer,
  SpotOrderType,
  SpotMarketOrderbookStreamCallback,
  SpotMarketTradeStreamCallback,
  SpotMarketOrderStreamCallback
} from '@injectivelabs/spot-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { TxProvider } from '../providers/TxProvider'
import { spotMarketStream } from '../singletons/SpotMarketStream'
import { streamManager } from '../singletons/StreamManager'
import {
  FEE_RECIPIENT,
  TESTNET_CHAIN_ID,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { UiPriceLevel, UiSpotMarket } from '~/types'
import { spotConsumer } from '~/app/singletons/SpotMarketConsumer'
import {
  orderTypeToGrpcOrderType,
  spotMarketToUiSpotMarket
} from '~/app/transformers/spot'
import { spotChronosConsumer } from '~/app/singletons/SpotMarketChronosConsumer'

export const fetchSpotMarkets = async (): Promise<UiSpotMarket[]> => {
  const markets = SpotMarketTransformer.grpcMarketsToMarkets(
    await spotConsumer.fetchMarkets()
  )
  const marketsSummary = await spotChronosConsumer.fetchSpotMarketsSummary()
  const marketWithSummaries = markets.filter((market) =>
    marketsSummary.find((m) => m.marketId === market.marketId)
  )

  return marketWithSummaries.map((market) => {
    const marketSummary = marketsSummary.find(
      (m) => m.marketId === market.marketId
    )!

    return spotMarketToUiSpotMarket(market, marketSummary)
  })
}

export const fetchSpotMarket = async (marketId: string) => {
  const market = SpotMarketTransformer.grpcMarketToMarket(
    await spotConsumer.fetchMarket(marketId)
  )
  const marketSummary = await spotChronosConsumer.fetchSpotMarketSummary(
    marketId
  )

  return spotMarketToUiSpotMarket(market, marketSummary)
}

export const fetchSpotMarketOrderbook = async (marketId: string) => {
  return SpotMarketTransformer.grpcOrderbookToOrderbook(
    await spotConsumer.fetchMarketOrderbook(marketId)
  )
}

export const streamOrderbook = (
  marketId: string,
  callback: SpotMarketOrderbookStreamCallback
) => {
  const stream = spotMarketStream.orderbook.start({
    marketId,
    callback
  })

  streamManager.set(stream, SpotMarketStreamType.Orderbook)
}

export const streamTrades = (
  marketId: string,
  callback: SpotMarketTradeStreamCallback
) => {
  const stream = spotMarketStream.trades.start({
    marketId,
    callback
  })

  streamManager.set(stream, SpotMarketStreamType.Trades)
}

export const streamSubaccountTrades = (
  marketId: string,
  subaccountId: string,
  callback: SpotMarketTradeStreamCallback
) => {
  const stream = spotMarketStream.trades.subaccount({
    marketId,
    subaccountId,
    callback
  })

  streamManager.set(stream, SpotMarketStreamType.SubaccountTrades)
}

export const streamSubaccountOrders = (
  marketId: string,
  subaccountId: string,
  callback: SpotMarketOrderStreamCallback
) => {
  const stream = spotMarketStream.orders.subaccount({
    marketId,
    subaccountId,
    callback
  })

  streamManager.set(stream, SpotMarketStreamType.SubaccountOrders)
}

export const cancelMarketStreams = () => {
  streamManager.cancel(SpotMarketStreamType.Orderbook)
  streamManager.cancel(SpotMarketStreamType.SubaccountOrders)
  streamManager.cancel(SpotMarketStreamType.SubaccountTrades)
  streamManager.cancel(SpotMarketStreamType.Trades)
}

export const fetchSpotMarketTrades = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId?: AccountAddress
}) => {
  return SpotMarketTransformer.grpcTradesToTrades(
    await spotConsumer.fetchMarketTrades({
      marketId,
      subaccountId
    })
  )
}

export const fetchSpotMarketOrders = async ({
  marketId,
  subaccountId
}: {
  marketId: string
  subaccountId: AccountAddress
}) => {
  return SpotMarketTransformer.grpcOrdersToOrders(
    await spotConsumer.fetchMarketOrders({
      marketId,
      subaccountId
    })
  )
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
  orderType: SpotOrderType
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
  injectiveAddress,
  subaccountId
}: {
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: SpotOrderType
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
  market: UiSpotMarket
  amount: BigNumberInBase
}): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const min = BigNumberInBase.min(remainAmountToFill, order.quantity)
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
