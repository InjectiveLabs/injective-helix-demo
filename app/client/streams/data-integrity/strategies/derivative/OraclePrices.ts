import { SharedMarketType, SharedUiBinaryOptionsMarket } from '@shared/types'
import { indexerOracleApi } from '@shared/Service'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'
import { MarketMarkPriceMap, UiDerivativeMarket } from '@/types'

export class DerivativeOraclePriceIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, MarketMarkPriceMap>
{
  static make(
    marketIds: MarketIdsArgs
  ): DerivativeOraclePriceIntegrityStrategy {
    return new DerivativeOraclePriceIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    if (!marketIds) {
      return
    }

    const latestMarketPrices = await this.fetchData()

    if (!latestMarketPrices) {
      return
    }

    if (Object.keys(latestMarketPrices).length === 0) {
      return
    }

    const derivativeStore = useDerivativeStore()

    const existingMarketPrices = { ...derivativeStore.marketMarkPriceMap }
    const isDataValid = this.verifyData(
      existingMarketPrices,
      latestMarketPrices
    )

    if (!isDataValid) {
      derivativeStore.cancelMarketsMarkPrices()
      derivativeStore.$patch({ marketMarkPriceMap: await this.fetchData() })
      derivativeStore.streamMarketsMarkPrices()
    }
  }

  verifyData(
    existingMarketPrices: MarketMarkPriceMap,
    latestMarketPrices: MarketMarkPriceMap
  ): boolean {
    return Object.entries(latestMarketPrices).every(
      ([marketId, latestPrice]) => {
        const existingPrice = existingMarketPrices[marketId]

        return existingPrice && existingPrice.price === latestPrice.price
      }
    )
  }

  async fetchData(): Promise<MarketMarkPriceMap> {
    const { args: marketIds } = this

    if (!marketIds) {
      return {}
    }

    const derivativeStore = useDerivativeStore()
    const markets = [
      ...derivativeStore.markets,
      ...derivativeStore.binaryOptionsMarkets
    ].filter((market) => marketIds.includes(market.marketId))

    const pricePromises = markets.map((market) =>
      (market.subType !== SharedMarketType.BinaryOptions
        ? indexerOracleApi.fetchOraclePrice({
            oracleType: market.oracleType,
            baseSymbol: (market as UiDerivativeMarket).oracleBase,
            quoteSymbol: (market as UiDerivativeMarket).oracleQuote
          })
        : indexerOracleApi.fetchOraclePriceNoThrow({
            baseSymbol: (market as SharedUiBinaryOptionsMarket).oracleSymbol,
            quoteSymbol: (market as SharedUiBinaryOptionsMarket).oracleProvider,
            oracleType: market.oracleType
          })
      ).then((oraclePrice) => ({
        marketId: market.marketId,
        price: oraclePrice.price
      }))
    )

    const marketPricesResults = await Promise.all(pricePromises)

    return marketPricesResults.reduce(
      (accumulatedMarketPrices, marketPrice) => {
        if (marketPrice) {
          accumulatedMarketPrices[marketPrice.marketId] = marketPrice
        }

        return accumulatedMarketPrices
      },
      {} as MarketMarkPriceMap
    )
  }
}
