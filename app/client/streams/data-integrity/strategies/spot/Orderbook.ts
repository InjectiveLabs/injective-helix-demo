import { ConcreteDataIntegrityStrategy } from '../../types'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import { indexerSpotApi } from '@/app/Services'
import { UiSpotOrderbookWithSequence } from '@/types'

export class SpotOrderbookIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements ConcreteDataIntegrityStrategy<string, UiSpotOrderbookWithSequence>
{
  constructor(public args: string) {
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
        existingOrderbook as UiSpotOrderbookWithSequence,
        latestOrderbook
      )

    if (!isDataValid) {
      spotStore.cancelOrderbookUpdateStream()
      spotStore.$patch({ orderbook: await this.fetchData() })
      spotStore.streamOrderbookUpdate(marketId)
    }
  }

  verifyData(
    existingOrderbook: UiSpotOrderbookWithSequence,
    latestOrderbook: UiSpotOrderbookWithSequence
  ): boolean {
    /**
     * Returns true if the existing orderbook is up-to-date or more recent
     **/
    return existingOrderbook.sequence >= latestOrderbook.sequence
  }

  async fetchData(): Promise<UiSpotOrderbookWithSequence | undefined> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    return await indexerSpotApi.fetchOrderbookV2(marketId)
  }
}
