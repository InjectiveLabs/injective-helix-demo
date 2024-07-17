import { indexerDerivativesApi } from '@shared/Service'
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class DerivativeSubaccountOrderIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, DerivativeLimitOrder>
{
  static make(
    marketIds: MarketIdsArgs
  ): DerivativeSubaccountOrderIntegrityStrategy {
    return new DerivativeSubaccountOrderIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()
    const sharedWalletStore = useSharedWalletStore()

    if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
      return
    }

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
    existingOrders: DerivativeLimitOrder[],
    latestOrders: DerivativeLimitOrder[]
  ): boolean {
    const [lastOrderFromStream] = existingOrders
    const [latestOrderFromFetch] = latestOrders

    /**
     * Each order should have its own unique orderHash
     **/
    return lastOrderFromStream?.orderHash === latestOrderFromFetch?.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()

    const { orders: latestOrders } = await indexerDerivativesApi.fetchOrders({
      isConditional: false,
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || derivativeStore.activeMarketIds,
      pagination: {
        limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
      }
    })

    return latestOrders
  }
}
