import {
  MarketType,
  UiPerpetualMarketWithToken,
  UiBinaryOptionsMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'
import { MarketMarkPriceMap } from '@/types'
import { indexerOracleApi } from '@/app/Services'

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
    const markets = derivativeStore.markets.filter((market) =>
      marketIds.includes(market.marketId)
    )

    const pricePromises = markets.map((market) =>
      (market.subType !== MarketType.BinaryOptions
        ? indexerOracleApi.fetchOraclePrice({
            oracleType: market.oracleType,
            baseSymbol: (market as UiPerpetualMarketWithToken).oracleBase,
            quoteSymbol: (market as UiPerpetualMarketWithToken).oracleQuote
          })
        : indexerOracleApi.fetchOraclePriceNoThrow({
            baseSymbol: (market as UiBinaryOptionsMarketWithToken).oracleSymbol,
            quoteSymbol: (market as UiBinaryOptionsMarketWithToken)
              .oracleProvider,
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
