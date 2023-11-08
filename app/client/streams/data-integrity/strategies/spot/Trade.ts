import { UiSpotTrade } from '@injectivelabs/sdk-ui-ts'
import { ConcreteDataIntegrityStrategy, MarketIdsArgs } from '../../types'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import { indexerSpotApi } from '@/app/Services'

export class SpotTradeIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, UiSpotTrade>
{
  static make(marketIds: string[] | undefined): SpotTradeIntegrityStrategy {
    return new SpotTradeIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    if (!marketIds) {
      return
    }

    const spotStore = useSpotStore()
    const accountStore = useAccountStore()

    const existingSpotTrades = [...spotStore.subaccountTrades]

    const { trades: latestTrades } = await indexerSpotApi.fetchTrades({
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || spotStore.activeMarketIds
    })

    if (latestTrades.length === 0) {
      return
    }

    const isDataValid = this.verifyData(existingSpotTrades, latestTrades)

    if (!isDataValid) {
      spotStore.$patch({ subaccountTrades: latestTrades })
      spotStore.cancelSubaccountTradesStream()

      const [marketId] = marketIds || []

      spotStore.streamSubaccountTrades(marketId)
    }
  }

  verifyData(
    existingSpotTrades: UiSpotTrade[],
    latestTrades: UiSpotTrade[]
  ): boolean {
    const [lastTradeFromStream] = existingSpotTrades
    const [latestTradeFromFetch] = latestTrades

    /**
     * each trade should have its own unique orderHash
     **/
    return lastTradeFromStream.orderHash === latestTradeFromFetch.orderHash
  }
}
