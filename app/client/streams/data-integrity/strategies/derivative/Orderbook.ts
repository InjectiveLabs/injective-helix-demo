import { indexerDerivativesApi } from '@shared/Service'
import { SharedUiOrderbookWithSequence } from '@shared/types'
import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class DerivativeOrderbookIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements
    ConcreteDataIntegrityStrategy<string, SharedUiOrderbookWithSequence>
{
  constructor(public override args: string) {
    super(args)
  }

  static make(marketId: string): DerivativeOrderbookIntegrityStrategy {
    return new DerivativeOrderbookIntegrityStrategy(marketId)
  }

  async validate(): Promise<void> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    const derivativeStore = useDerivativeStore()

    const latestOrderbook = await this.fetchData()

    if (!latestOrderbook) {
      return
    }

    const existingOrderbook = { ...derivativeStore.orderbook }

    const isDataValid =
      Object.keys(existingOrderbook).length > 0 &&
      this.verifyData(
        existingOrderbook as SharedUiOrderbookWithSequence,
        latestOrderbook
      )

    if (!isDataValid) {
      derivativeStore.cancelOrderbookUpdateStream()
      derivativeStore.$patch({ orderbook: await this.fetchData() })
      derivativeStore.streamOrderbookUpdate(marketId)
    }
  }

  verifyData(
    existingOrderbook: SharedUiOrderbookWithSequence,
    latestOrderbook: SharedUiOrderbookWithSequence
  ): boolean {
    return existingOrderbook.sequence >= latestOrderbook.sequence
  }

  async fetchData(): Promise<SharedUiOrderbookWithSequence | undefined> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    return await indexerDerivativesApi.fetchOrderbookV2(marketId)
  }
}
