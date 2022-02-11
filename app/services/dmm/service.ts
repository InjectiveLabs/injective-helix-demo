import {
  MarketType,
  ServiceOptions,
  INJ_COIN_GECKO_ID
} from '@injectivelabs/ui-common'
import {
  DerivativeMarketConsumer,
  DerivativeTransformer
} from '@injectivelabs/derivatives-consumer'
import {
  DMMConsumer,
  DMMTransformer as BaseDMMTransformer
} from '@injectivelabs/exchange-consumer'
import {
  SpotMarketConsumer,
  SpotTransformer
} from '@injectivelabs/spot-consumer'
import { isAfter, format } from 'date-fns'
import { BaseService } from '@injectivelabs/ui-common/dist/BaseService'
import {
  DMMMetrics,
  UiBaseEpochMarkets,
  UiEpochMarkets,
  UiEpochMeta
} from './types'
import { DMMTransformer } from './transformer'
import { coinGeckoApi } from '~/app/Services'

export class DmmService extends BaseService {
  protected consumer: DMMConsumer

  protected spotConsumer: SpotMarketConsumer

  protected derivativeConsumer: DerivativeMarketConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.consumer = new DMMConsumer('https://dmm.exchange.injective.network')
    this.spotConsumer = new SpotMarketConsumer(this.endpoints.sentryGrpcApi)
    this.derivativeConsumer = new DerivativeMarketConsumer(
      this.endpoints.sentryGrpcApi
    )
  }

  async fetchDMMRecords({
    accountAddress,
    dmmName,
    epochId
  }: {
    accountAddress?: string
    dmmName?: string
    epochId?: string
  }) {
    try {
      const promise = this.consumer.fetchDMMRecords({
        accountAddress,
        dmmName,
        epochId
      })

      const dmmRecords = await this.fetchOrFetchAndMeasure(
        promise,
        DMMMetrics.FetchDMMRecords
      )

      return dmmRecords.map(
        BaseDMMTransformer.grpcEpochResultRecordToEpochResultRecord
      )
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  async fetchEpochs() {
    const promise = this.consumer.fetchEpochs()

    const epochs = await this.fetchOrFetchAndMeasure(
      promise,
      DMMMetrics.FetchEpochs
    )

    return epochs
      .map(BaseDMMTransformer.grpcEpochMetaToEpochMeta)
      .map(DMMTransformer.EpochMetaToUiEpochDate)
  }

  async fetchEpochSummary({ epochId }: { epochId?: string }) {
    const promise = this.consumer.fetchEpochSummary({ epochId })

    const epochSummary = await this.fetchOrFetchAndMeasure(
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
      const { meta, result } = BaseDMMTransformer.grpcEpochToEpoch(epochSummary)

      return {
        meta: meta ? DMMTransformer.EpochMetaToUiEpochMeta(meta) : emptyMeta,
        result: result || emptyResult
      }
    }

    return {
      meta: emptyMeta,
      result: emptyResult
    }
  }

  async fetchMarkets(markets: UiEpochMarkets[]) {
    return (await Promise.all(
      markets.map(async (market) => {
        try {
          const derivativeMarket = await this.derivativeConsumer.fetchMarket(
            market.marketId
          )
          const transformedMarket = DerivativeTransformer.grpcMarketToMarket(
            derivativeMarket
          )

          return {
            ...market,
            ticker: transformedMarket.ticker,
            type: MarketType.Derivative,
            subType: MarketType.Perpetual
          }
        } catch {
          // ignore
        }
        try {
          const spotMarket = await this.spotConsumer.fetchMarket(
            market.marketId
          )
          const transformedMarket = SpotTransformer.grpcMarketToMarket(
            spotMarket
          )

          return {
            ...market,
            ticker: transformedMarket.ticker,
            type: MarketType.Spot,
            subType: MarketType.Spot
          }
        } catch {
          // ignore
        }

        return {
          ...market,
          ticker: undefined,
          type: undefined,
          subType: undefined
        }
      })
    )) as UiBaseEpochMarkets[]
  }

  async fetchEpochUsdPrice(meta: UiEpochMeta): Promise<number> {
    const date = new Date(meta.endTime)
    if (isAfter(date, new Date())) {
      const priceInUsd = await coinGeckoApi.fetchUsdPrice(INJ_COIN_GECKO_ID)

      return Number(priceInUsd || 0)
    }

    const {
      market_data: {
        current_price: { usd: historyPrice }
      }
    } = await coinGeckoApi.fetchHistory(INJ_COIN_GECKO_ID, {
      date: `${date.getUTCDate()}-${format(date, 'MM-yyyy')}`
    })

    return Number(historyPrice)
  }
}
