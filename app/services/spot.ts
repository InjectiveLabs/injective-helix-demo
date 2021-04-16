import {
  SpotMarketTransformer,
  UiPriceLevel
} from '@injectivelabs/spot-consumer'
import { AccountAddress } from '@injectivelabs/ts-types'
import { UiSpotMarket } from '~/types'
import { spotConsumer } from '~/app/singletons/SpotMarketConsumer'
import { spotMarketToUiSpotMarket } from '~/app/transformers/spot'
import { spotChronosConsumer } from '~/app/singletons/SpotMarketChronosConsumer'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_WEI } from '../utils/constants'

export const fetchSpotMarkets = async (): Promise<UiSpotMarket[]> => {
  const markets = SpotMarketTransformer.marketsToUiMarkets(
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
  const market = SpotMarketTransformer.marketToUiMarket(
    await spotConsumer.fetchMarket(marketId)
  )
  const marketSummary = await spotChronosConsumer.fetchSpotMarketSummary(
    marketId
  )

  return spotMarketToUiSpotMarket(market, marketSummary)
}

export const fetchSpotMarketOrderbook = async (marketId: string) => {
  return SpotMarketTransformer.orderbookToUiOrderbook(
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
  return SpotMarketTransformer.tradesToUiTrades(
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
  return SpotMarketTransformer.ordersToUiOrders(
    await spotConsumer.fetchMarketOrders({
      marketId,
      subaccountId
    })
  )
}

export const calculateExecutionPriceFromOrderbook = (
  records: UiPriceLevel[],
  amount: BigNumberInBase
): BigNumberInWei => {
  const { sum, remainAmountToFill } = records.reduce(
    ({ sum, remainAmountToFill }, order: UiPriceLevel) => {
      const min = BigNumberInBase.min(remainAmountToFill, order.quantity)

      return {
        sum: sum.plus(new BigNumberInWei(order.price).times(min)),
        remainAmountToFill: remainAmountToFill.minus(min)
      }
    },
    { sum: ZERO_IN_WEI, remainAmountToFill: amount }
  )

  return sum.div(amount.minus(remainAmountToFill))
}
