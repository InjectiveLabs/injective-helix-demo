import { indexerSpotApi } from '@shared/Service'
import { SharedUiOrderbookWithSequence } from '@shared/types'
import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class SpotOrderbookIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements
    ConcreteDataIntegrityStrategy<string, SharedUiOrderbookWithSequence>
{
  constructor(public override args: string) {
    super(args)
  }

  static make(marketId: string): SpotOrderbookIntegrityStrategy {
    return new SpotOrderbookIntegrityStrategy(marketId)
  }

  async validate(): Promise<void> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    const spotStore = useSpotStore()

    const latestOrderbook = await this.fetchData()

    if (!latestOrderbook) {
      return
    }

    const existingOrderbook = { ...spotStore.orderbook }

    const isDataValid =
      Object.keys(existingOrderbook).length > 0 &&
      this.verifyData(
        existingOrderbook as SharedUiOrderbookWithSequence,
        latestOrderbook
      )

    if (!isDataValid) {
      spotStore.cancelOrderbookUpdateStream()
      spotStore.$patch({ orderbook: await this.fetchData() })
      spotStore.streamOrderbookUpdate(marketId)
    }
  }

  verifyData(
    existingOrderbook: SharedUiOrderbookWithSequence,
    latestOrderbook: SharedUiOrderbookWithSequence
  ): boolean {
    /**
     * Returns true if the existing orderbook is up-to-date or more recent
     **/
    return existingOrderbook.sequence >= latestOrderbook.sequence
  }

  async fetchData(): Promise<SharedUiOrderbookWithSequence | undefined> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    return await indexerSpotApi.fetchOrderbookV2(marketId)
  }
}
