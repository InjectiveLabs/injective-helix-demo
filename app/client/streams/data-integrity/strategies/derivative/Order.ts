import { UiDerivativeLimitOrder } from '@injectivelabs/sdk-ui-ts'
import { ConcreteDataIntegrityStrategy, MarketIdsArgs } from '../../types'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import { indexerDerivativesApi } from '@/app/Services'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export class DerivativeOrderIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements
    ConcreteDataIntegrityStrategy<MarketIdsArgs, UiDerivativeLimitOrder>
{
  static make(
    marketIds: string[] | undefined
  ): DerivativeOrderIntegrityStrategy {
    return new DerivativeOrderIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    if (!marketIds) {
      return
    }

    const derivativeStore = useDerivativeStore()

    const latestOrders = await this.fetchData()

    if (!latestOrders || latestOrders.length === 0) {
      return
    }

    const existingOrders = [...derivativeStore.subaccountOrders]
    const isDataValid = this.verifyData(existingOrders, latestOrders)

    if (!isDataValid) {
      derivativeStore.cancelSubaccountOrdersStream()
      derivativeStore.$patch({ subaccountOrders: await this.fetchData() })

      const [marketId] = marketIds || []
      derivativeStore.streamSubaccountOrders(marketId)
    }
  }

  verifyData(
    existingOrders: UiDerivativeLimitOrder[],
    latestOrders: UiDerivativeLimitOrder[]
  ): boolean {
    const [lastOrderFromStream] = existingOrders
    const [latestOrderFromFetch] = latestOrders

    // each order should have its own unique orderHash
    return lastOrderFromStream.orderHash === latestOrderFromFetch.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

    if (!marketIds) {
      return []
    }

    const derivativeStore = useDerivativeStore()
    const accountStore = useAccountStore()

    const { orders: latestOrders } = await indexerDerivativesApi.fetchOrders({
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || derivativeStore.activeMarketIds,
      pagination: {
        limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
      }
    })

    return latestOrders
  }
}
