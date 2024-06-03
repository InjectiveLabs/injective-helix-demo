import { indexerDerivativesApi } from '@shared/Service'
import { SharedUiDerivativeTrade } from '@shared/types'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class DerivativeTradeIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements ConcreteDataIntegrityStrategy<string, SharedUiDerivativeTrade>
{
  static make(marketId: string): DerivativeTradeIntegrityStrategy {
    return new DerivativeTradeIntegrityStrategy(marketId)
  }

  async validate(): Promise<void> {
    const { args: marketId } = this

    const derivativeStore = useDerivativeStore()

    const latestTrades = await this.fetchData()

    if (!latestTrades || latestTrades.length === 0) {
      return
    }

    const existingTrades = [...derivativeStore.trades]

    const isDataValid = this.verifyData(existingTrades, latestTrades)

    if (!isDataValid) {
      derivativeStore.cancelTradesStream()
      derivativeStore.$patch({ trades: await this.fetchData() })
      derivativeStore.streamTrades(marketId)
    }
  }

  verifyData(
    existingTrades: SharedUiDerivativeTrade[],
    latestTrades: SharedUiDerivativeTrade[]
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

    const { trades: latestTrades } = await indexerDerivativesApi.fetchTrades({
      marketIds: [marketId],
      executionSide: TradeExecutionSide.Taker
    })

    return latestTrades
  }
}
