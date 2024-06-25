import { indexerSpotApi } from '@shared/Service'
import { SharedUiSpotTrade } from '@shared/types'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class SpotSubaccountTradeIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, SharedUiSpotTrade>
{
  static make(
    marketIds: string[] | undefined
  ): SpotSubaccountTradeIntegrityStrategy {
    return new SpotSubaccountTradeIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const walletStore = useSharedWalletStore()
    const spotStore = useSpotStore()

    if (!walletStore.isUserConnected || !accountStore.subaccountId) {
      return
    }

    const latestTrades = await this.fetchData()

    if (!latestTrades || latestTrades.length === 0) {
      return
    }

    const existingSpotTrades = [...spotStore.subaccountTrades]

    const isDataValid = this.verifyData(existingSpotTrades, latestTrades)

    if (!isDataValid) {
      spotStore.cancelSubaccountTradesStream()

      spotStore.$patch({ subaccountTrades: await this.fetchData() })

      const [marketId] = marketIds || []

      spotStore.streamSubaccountTrades(marketId)
    }
  }

  verifyData(
    existingSpotTrades: SharedUiSpotTrade[],
    latestTrades: SharedUiSpotTrade[]
  ): boolean {
    const [lastTradeFromStream] = existingSpotTrades
    const [latestTradeFromFetch] = latestTrades

    /**
     * each trade should have its own unique orderHash
     **/
    return lastTradeFromStream?.orderHash === latestTradeFromFetch?.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const spotStore = useSpotStore()

    const { trades: latestTrades } = await indexerSpotApi.fetchTrades({
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || spotStore.activeMarketIds
    })

    return latestTrades
  }
}
