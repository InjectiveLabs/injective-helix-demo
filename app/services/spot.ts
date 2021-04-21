import {
  SpotMarketComposer,
  SpotMarketTransformer,
  SpotOrderType
} from '@injectivelabs/spot-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { transactionConsumer } from '~/app/singletons/TransactionConsumer'
import {
  FEE_RECIPIENT,
  TESTNET_CHAIN_ID,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { SpotMarketMap, UiPriceLevel, UiSpotMarket } from '~/types'
import { spotConsumer } from '~/app/singletons/SpotMarketConsumer'
import { spotMarketToUiSpotMarket } from '~/app/transformers/spot'
import { spotChronosConsumer } from '~/app/singletons/SpotMarketChronosConsumer'
import { getWeb3Strategy } from '~/app/web3'

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
  marketId,
  injectiveAddress,
  subaccountId
}: {
  price: BigNumberInBase
  quantity: BigNumberInBase
  orderType: SpotOrderType
  subaccountId: string
  marketId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const web3Strategy = getWeb3Strategy()
  const message = SpotMarketComposer.createLimitOrder({
    subaccountId,
    marketId,
    injectiveAddress,
    order: {
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      price: price.toString(),
      triggerPrice: '0', // TODO
      quantity: quantity.toString()
    }
  })

  const txResponse = await transactionConsumer.prepareTxRequest({
    address,
    message,
    chainId: TESTNET_CHAIN_ID
  })

  console.log(txResponse.getData())

  try {
    const signature = await web3Strategy.signTypedDataV4(
      txResponse.getData(),
      address
    )

    return await transactionConsumer.broadcastTxRequest({
      signature,
      message,
      pubKeyType: txResponse.getPubKeyType(),
      typedData: txResponse.getData(),
      chainId: TESTNET_CHAIN_ID
    })
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const submitMarketOrder = async ({
  quantity,
  price,
  orderType,
  address,
  marketId,
  injectiveAddress,
  subaccountId
}: {
  quantity: BigNumberInBase
  price: BigNumberInBase
  orderType: SpotOrderType
  subaccountId: string
  marketId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const web3Strategy = getWeb3Strategy()
  const message = SpotMarketComposer.createMarketOrder({
    subaccountId,
    marketId,
    injectiveAddress,
    order: {
      price: price.toString(),
      orderType: orderTypeToGrpcOrderType(orderType),
      feeRecipient: FEE_RECIPIENT,
      triggerPrice: '0', // TODO
      quantity: quantity.toString()
    }
  })

  const txResponse = await transactionConsumer.prepareTxRequest({
    address,
    message,
    chainId: TESTNET_CHAIN_ID
  })

  try {
    const signature = await web3Strategy.signTypedDataV4(
      txResponse.getData(),
      address
    )

    return await transactionConsumer.broadcastTxRequest({
      signature,
      message,
      pubKeyType: txResponse.getPubKeyType(),
      typedData: txResponse.getData(),
      chainId: TESTNET_CHAIN_ID
    })
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const cancelOrder = async ({
  orderHash,
  orderType,
  address,
  marketId,
  injectiveAddress,
  subaccountId
}: {
  orderHash: string
  orderType: SpotOrderType
  subaccountId: string
  marketId: string
  address: AccountAddress
  injectiveAddress: AccountAddress
}) => {
  const web3Strategy = getWeb3Strategy()
  const message = SpotMarketComposer.cancelSpotOrder({
    subaccountId,
    marketId,
    injectiveAddress,
    order: {
      orderHash,
      isBuy: orderType === SpotOrderType.Buy
    }
  })

  const txResponse = await transactionConsumer.prepareTxRequest({
    address,
    message,
    chainId: TESTNET_CHAIN_ID
  })

  try {
    const signature = await web3Strategy.signTypedDataV4(
      txResponse.getData(),
      address
    )

    return await transactionConsumer.broadcastTxRequest({
      signature,
      message,
      pubKeyType: txResponse.getPubKeyType(),
      typedData: txResponse.getData(),
      chainId: TESTNET_CHAIN_ID
    })
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const orderTypeToGrpcOrderType = (
  orderType: SpotOrderType
): SpotMarketMap => {
  switch (orderType) {
    case SpotOrderType.Buy:
      return SpotMarketMap.BUY
    case SpotOrderType.Sell:
      return SpotMarketMap.SELL
    case SpotOrderType.StopBuy:
      return SpotMarketMap.STOP_BUY
    case SpotOrderType.TakeBuy:
      return SpotMarketMap.TAKE_BUY
    case SpotOrderType.TakeSell:
      return SpotMarketMap.TAKE_SELL
    default:
      return SpotMarketMap.BUY
  }
}

export const calculateExecutionPriceFromOrderbook = (
  records: UiPriceLevel[],
  amount: BigNumberInBase
): BigNumberInBase => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const min = BigNumberInBase.min(remainAmountToFill, order.quantity)

      return {
        sum: sum.plus(new BigNumberInBase(order.price).times(min)),
        remainAmountToFill: remainAmountToFill.minus(min)
      }
    },
    { sum: ZERO_IN_BASE, remainAmountToFill: amount }
  )

  return sum.div(amount.minus(remainAmountToFill))
}
