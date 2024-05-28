import { indexerSpotApi } from '@shared/Service'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export class SpotSubaccountOrderIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, SpotLimitOrder>
{
  static make(
    marketIds: string[] | undefined
  ): SpotSubaccountOrderIntegrityStrategy {
    return new SpotSubaccountOrderIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const walletStore = useWalletStore()
    const spotStore = useSpotStore()

    if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
      return
    }

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
    existingSpotOrders: SpotLimitOrder[],
    latestOrders: SpotLimitOrder[]
  ): boolean {
    const [lastOrderFromStream] = existingSpotOrders
    const [latestOrderFromFetch] = latestOrders

    /**
     * Each order should have its own unique orderHash
     **/
    return lastOrderFromStream?.orderHash === latestOrderFromFetch?.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

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
