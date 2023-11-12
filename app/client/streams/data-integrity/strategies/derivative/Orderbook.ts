import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'
import { indexerDerivativesApi } from '@/app/Services'
import { UiDerivativeOrderbookWithSequence } from '@/types'

export class DerivativeOrderbookIntegrityStrategy
  extends BaseDataIntegrityStrategy<string>
  implements
    ConcreteDataIntegrityStrategy<string, UiDerivativeOrderbookWithSequence>
{
  constructor(public args: string) {
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
        existingOrderbook as UiDerivativeOrderbookWithSequence,
        latestOrderbook
      )

    if (!isDataValid) {
      derivativeStore.cancelOrderbookUpdateStream()
      derivativeStore.$patch({ orderbook: await this.fetchData() })
      derivativeStore.streamOrderbookUpdate(marketId)
    }
  }

  verifyData(
    existingOrderbook: UiDerivativeOrderbookWithSequence,
    latestOrderbook: UiDerivativeOrderbookWithSequence
  ): boolean {
    return existingOrderbook.sequence >= latestOrderbook.sequence
  }

  async fetchData(): Promise<UiDerivativeOrderbookWithSequence | undefined> {
    const { args: marketId } = this

    if (!marketId) {
      return
    }

    return await indexerDerivativesApi.fetchOrderbookV2(marketId)
  }
}
