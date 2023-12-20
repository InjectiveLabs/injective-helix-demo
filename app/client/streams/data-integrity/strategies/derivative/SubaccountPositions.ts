import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { indexerDerivativesApi } from '@/app/Services'

export class DerivativeSubaccountPositionIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, UiPosition[]>
{
  static make(
    marketIds: MarketIdsArgs
  ): DerivativeSubaccountPositionIntegrityStrategy {
    return new DerivativeSubaccountPositionIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const marketIds = this.args

    const accountStore = useAccountStore()
    const walletStore = useWalletStore()

    if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
      return
    }

    const latestPositions = await this.fetchData()

    if (!latestPositions || latestPositions.length === 0) {
      return
    }

    const positionStore = usePositionStore()

    const existingPositions = [...positionStore.subaccountPositions]

    const isDataValid = this.verifyData(existingPositions, latestPositions)

    if (!isDataValid) {
      positionStore.cancelSubaccountPositionsStream()
      positionStore.$patch({ subaccountPositions: await this.fetchData() })

      const [marketId] = marketIds || []
      positionStore.streamSubaccountPositions(marketId)
    }
  }

  verifyData(
    existingPositions: UiPosition[],
    latestPositions: UiPosition[]
  ): boolean {
    return existingPositions.every((existingPosition) =>
      latestPositions.find(
        (latestPosition) =>
          existingPosition?.marketId === latestPosition?.marketId &&
          existingPosition?.updatedAt === latestPosition?.updatedAt
      )
    )
  }

  async fetchData(): Promise<UiPosition[]> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()

    const { positions: latestPositions } =
      await indexerDerivativesApi.fetchPositions({
        subaccountId: accountStore.subaccountId,
        marketIds: marketIds || derivativeStore.activeMarketIds
      })

    return latestPositions
  }
}
