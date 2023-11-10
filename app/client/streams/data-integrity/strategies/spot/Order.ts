import { UiSpotLimitOrder } from '@injectivelabs/sdk-ui-ts'
import { ConcreteDataIntegrityStrategy, MarketIdsArgs } from '../../types'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import { indexerSpotApi } from '@/app/Services'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export class SpotOrderIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, UiSpotLimitOrder>
{
  static make(marketIds: string[] | undefined): SpotOrderIntegrityStrategy {
    return new SpotOrderIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    if (!marketIds) {
      return
    }

    const spotStore = useSpotStore()

    const latestOrders = await this.fetchData()

    if (!latestOrders || latestOrders.length === 0) {
      return
    }

    const existingSpotOrders = [...spotStore.subaccountOrders]
    const isDataValid = this.verifyData(existingSpotOrders, latestOrders)

    if (!isDataValid) {
      spotStore.cancelSubaccountOrdersStream()
      spotStore.$patch({ subaccountOrders: await this.fetchData() })

      const [marketId] = marketIds || []

      spotStore.streamSubaccountOrders(marketId)
    }
  }

  verifyData(
    existingSpotOrders: UiSpotLimitOrder[],
    latestOrders: UiSpotLimitOrder[]
  ): boolean {
    const [lastOrderFromStream] = existingSpotOrders
    const [latestOrderFromFetch] = latestOrders

    /**
     * each order should have its own unique orderHash
     **/
    return lastOrderFromStream.orderHash === latestOrderFromFetch.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

    if (!marketIds) {
      return
    }

    const spotStore = useSpotStore()
    const accountStore = useAccountStore()

    const { orders: latestOrders } = await indexerSpotApi.fetchOrders({
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || spotStore.activeMarketIds,
      pagination: {
        limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
      }
    })

    return latestOrders
  }
}
