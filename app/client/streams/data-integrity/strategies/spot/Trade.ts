import { indexerSpotApi } from '@shared/Service'
import { SharedUiSpotTrade } from '@shared/types'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class SpotTradeIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements ConcreteDataIntegrityStrategy<string, SharedUiSpotTrade>
{
  static make(marketId: string): SpotTradeIntegrityStrategy {
    return new SpotTradeIntegrityStrategy(marketId)
  }

  async validate(): Promise<void> {
    const { args: marketId } = this

    const spotStore = useSpotStore()

    const latestTrades = await this.fetchData()

    if (!latestTrades || latestTrades.length === 0) {
      return
    }

    const existingTrades = [...spotStore.trades]

    const isDataValid = this.verifyData(existingTrades, latestTrades)

    if (!isDataValid) {
      spotStore.cancelTradesStream()
      spotStore.$patch({ trades: await this.fetchData() })
      spotStore.streamTrades(marketId)
    }
  }

  verifyData(
    existingTrades: SharedUiSpotTrade[],
    latestTrades: SharedUiSpotTrade[]
  ): boolean {
    const [lastTradeFromStream] = existingTrades
    const [latestTradeFromFetch] = latestTrades

    /**
     * Assuming each trade has a unique orderHash
     **/
    return lastTradeFromStream?.orderHash === latestTradeFromFetch?.orderHash
  }

  async fetchData() {
    const { args: marketId } = this

    const { trades: latestTrades } = await indexerSpotApi.fetchTrades({
      marketIds: [marketId],
      executionSide: TradeExecutionSide.Taker
    })

    return latestTrades
  }
}
