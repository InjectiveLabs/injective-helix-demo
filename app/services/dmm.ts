import { DMMTransformer } from '@injectivelabs/exchange-consumer'
import { SpotTransformer } from '@injectivelabs/spot-consumer'
import { DerivativeTransformer } from '@injectivelabs/derivatives-consumer'
import { isAfter, format } from 'date-fns'
import { baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData } from '../transformers/spot'
import { baseUiDerivativeMarketToBaseUiDerivativeMarketWithPartialTokenMetaData } from '~/app/transformers/derivatives'
import { metricsProvider } from '~/app/providers/MetricsProvider'
import { coinGeckoConsumer } from '~/app/singletons/CoinGeckoConsumer'
import { dmmConsumer } from '~/app/singletons/DMMConsumer'
import { spotConsumer } from '~/app/singletons/SpotMarketConsumer'
import { derivativeConsumer } from '~/app/singletons/DerivativeMarketConsumer'
import { DMMMetrics } from '~/types/metrics'
import {
  EpochMetaToUiEpochMeta,
  EpochMetaToUiEpochDate
} from '~/app/transformers/dmm'
import {
  MarketType,
  UiEpochMeta,
  UiEpochMarkets,
  UiEpochMarketsWithTokenMeta
} from '~/types'
import { BITCOIN_GECKO_ID, INJ_COIN_GECKO_ID } from '~/app/utils/constants'

export const fetchDMMRecords = async ({
  accountAddress,
  dmmName,
  epochId
}: {
  accountAddress?: string
  dmmName?: string
  epochId?: string
}) => {
  const promise = dmmConsumer.fetchDMMRecords({
    accountAddress,
    dmmName,
    epochId
  })

  const dmmRecords = await metricsProvider.sendAndRecord(
    promise,
    DMMMetrics.FetchDMMRecords
  )

  return dmmRecords.map(DMMTransformer.grpcEpochResultRecordToEpochResultRecord)
}

export const fetchEpochs = async () => {
  const promise = dmmConsumer.fetchEpochs()

  const epochs = await metricsProvider.sendAndRecord(
    promise,
    DMMMetrics.FetchEpochs
  )

  return epochs
    .map(DMMTransformer.grpcEpochMetaToEpochMeta)
    .map(EpochMetaToUiEpochDate)
}

export const fetchEpochSummary = async ({ epochId }: { epochId?: string }) => {
  const promise = dmmConsumer.fetchEpochSummary({ epochId })

  const epochSummary = await metricsProvider.sendAndRecord(
    promise,
    DMMMetrics.FetchEpochSummary
  )

  const emptyMeta = { meta: { id: '' }, markets: [], marketMakers: [] }
  const emptyResult = {
    createdAt: '',
    lcs: { summaryMap: {}, byMarketsMap: {} },
    vcs: { summaryMap: {}, byMarketsMap: {}, byDateMap: {} }
  }

  if (epochSummary) {
    const { meta, result } = DMMTransformer.grpcEpochToEpoch(epochSummary)

    return {
      meta: meta ? EpochMetaToUiEpochMeta(meta) : emptyMeta,
      result: result || emptyResult
    }
  }

  return {
    meta: emptyMeta,
    result: emptyResult
  }
}

export const findActiveMarket = (
  markets: UiEpochMarketsWithTokenMeta[]
): string => {
  const btcMarkets = markets.filter(
    ({ token }: UiEpochMarketsWithTokenMeta) => {
      return token?.coinGeckoId === BITCOIN_GECKO_ID
    }
  )

  // set default market to BTC PERP || BTC Spot
  const defaultMarket =
    btcMarkets.length > 0
      ? btcMarkets.find(({ subType }) => subType === MarketType.Perpetual) ||
        btcMarkets[0]
      : undefined

  return defaultMarket?.marketId || markets[0].marketId
}

export const fetchMarkets = async (markets: UiEpochMarkets[]) => {
  const transformedMarkets = await Promise.all(
    markets.map(async (market) => {
      try {
        const derivativeMarket = await derivativeConsumer.fetchMarket(
          market.marketId
        )
        const transformedMarket = await baseUiDerivativeMarketToBaseUiDerivativeMarketWithPartialTokenMetaData(
          DerivativeTransformer.grpcMarketToMarket(derivativeMarket)
        )

        return {
          ...market,
          ticker: transformedMarket.ticker,
          token: transformedMarket.baseToken,
          type: MarketType.Derivative,
          subType: MarketType.Perpetual
        }
      } catch {
        // ignore
      }
      try {
        const spotMarket = await spotConsumer.fetchMarket(market.marketId)
        const transformedMarket = await baseUiSpotMarketToBaseUiSpotMarketWithPartialTokenMetaData(
          SpotTransformer.grpcMarketToMarket(spotMarket)
        )

        return {
          ...market,
          ticker: transformedMarket.ticker,
          token: transformedMarket.baseToken,
          type: MarketType.Spot,
          subType: MarketType.Spot
        }
      } catch {
        // ignore
      }

      return {
        ...market,
        ticker: undefined,
        token: undefined,
        type: undefined,
        subType: undefined
      }
    })
  )

  return transformedMarkets.filter(
    (market) => market.token !== undefined
  ) as UiEpochMarketsWithTokenMeta[]
}

export const fetchEpochUsdPrice = async (
  meta: UiEpochMeta
): Promise<number> => {
  const date = new Date(meta.endTime)
  if (isAfter(date, new Date())) {
    const {
      data: {
        market_data: {
          current_price: { usd: currentPrice }
        }
      }
    } = await coinGeckoConsumer.fetchCoin(INJ_COIN_GECKO_ID)

    return Number(currentPrice)
  }

  const {
    data: {
      market_data: {
        current_price: { usd: historyPrice }
      }
    }
  } = await coinGeckoConsumer.fetchHistory(
    INJ_COIN_GECKO_ID,
    `${date.getUTCDate()}-${format(date, 'MM-yyyy')}`
  )

  return Number(historyPrice)
}
