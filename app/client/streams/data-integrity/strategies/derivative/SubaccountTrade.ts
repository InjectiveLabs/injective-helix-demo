import { DerivativeTrade } from '@injectivelabs/sdk-ts'
import { indexerDerivativesApi } from '@shared/Service'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'

export class DerivativeSubaccountTradeIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, DerivativeTrade[]>
{
  static make(
    marketIds: string[] | undefined
  ): DerivativeSubaccountTradeIntegrityStrategy {
    return new DerivativeSubaccountTradeIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()
    const sharedWalletStore = useSharedWalletStore()

    if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
      return
    }

    const latestTrades = await this.fetchData()

    if (!latestTrades || latestTrades.length === 0) {
      return
    }

    const existingTrades = [...derivativeStore.subaccountTrades]

    const isDataValid = this.verifyData(existingTrades, latestTrades)

    if (!isDataValid) {
      derivativeStore.cancelSubaccountTradesStream()

      derivativeStore.$patch({ subaccountTrades: await this.fetchData() })

      const [marketId] = marketIds || []

      derivativeStore.streamSubaccountTrades(marketId)
    }
  }

  verifyData(
    existingTrades: DerivativeTrade[],
    latestTrades: DerivativeTrade[]
  ): boolean {
    const [lastTradeFromStream] = existingTrades
    const [latestTradeFromFetch] = latestTrades

    /**
     * each trade should have its own unique orderHash
     **/
    return lastTradeFromStream?.orderHash === latestTradeFromFetch?.orderHash
  }

  async fetchData() {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()

    const { trades: latestTrades } = await indexerDerivativesApi.fetchTrades({
      subaccountId: accountStore.subaccountId,
      marketIds: marketIds || derivativeStore.activeMarketIds
    })

    return latestTrades
  }
}
