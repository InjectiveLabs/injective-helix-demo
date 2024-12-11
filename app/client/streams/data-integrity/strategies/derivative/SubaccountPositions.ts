import { PositionV2 } from '@injectivelabs/sdk-ts'
import { indexerDerivativesApi } from '@shared/Service'
import {
  MarketIdsArgs,
  ConcreteDataIntegrityStrategy
} from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies/BaseDataIntegrityStrategy'

export class DerivativeSubaccountPositionIntegrityStrategy
  extends BaseDataIntegrityStrategy<MarketIdsArgs>
  implements ConcreteDataIntegrityStrategy<MarketIdsArgs, PositionV2[]>
{
  static make(
    marketIds: MarketIdsArgs
  ): DerivativeSubaccountPositionIntegrityStrategy {
    return new DerivativeSubaccountPositionIntegrityStrategy(marketIds)
  }

  async validate(): Promise<void> {
    const marketIds = this.args

    const accountStore = useAccountStore()
    const sharedWalletStore = useSharedWalletStore()

    if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
      return
    }

    const latestPositions = await this.fetchData()

    if (!latestPositions || latestPositions.length === 0) {
      return
    }

    const positionStore = usePositionStore()

    const existingPositions = [...positionStore.positions]

    const isDataValid = this.verifyData(existingPositions, latestPositions)

    if (!isDataValid) {
      positionStore.cancelSubaccountPositionsStream()
      positionStore.$patch({ positions: await this.fetchData() })

      const [marketId] = marketIds || []
      positionStore.streamSubaccountPositions(marketId)
    }
  }

  verifyData(
    existingPositions: PositionV2[],
    latestPositions: PositionV2[]
  ): boolean {
    return existingPositions.every((existingPosition) =>
      latestPositions.find(
        (latestPosition) =>
          existingPosition?.marketId === latestPosition?.marketId &&
          existingPosition?.updatedAt === latestPosition?.updatedAt
      )
    )
  }

  async fetchData(): Promise<PositionV2[]> {
    const { args: marketIds } = this

    const accountStore = useAccountStore()
    const derivativeStore = useDerivativeStore()

    const { positions: latestPositions } =
      await indexerDerivativesApi.fetchPositionsV2({
        subaccountId: accountStore.subaccountId,
        marketIds: marketIds || derivativeStore.activeMarketIds
      })

    return latestPositions
  }
}
