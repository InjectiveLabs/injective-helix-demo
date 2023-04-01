import { BigNumberInBase } from '@injectivelabs/utils'
import {
  streamSubaccountPositions as grpcStreamSubaccountPositions,
  cancelSubaccountPositionsStream as grpcCancelSubaccountPositionsStream
} from '@/app/client/streams/derivatives'

export const cancelSubaccountPositionsStream =
  grpcCancelSubaccountPositionsStream

export const streamSubaccountPositions = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const positionStore = usePositionStore()

  const { subaccountId } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  grpcStreamSubaccountPositions({
    subaccountId,
    marketId,
    callback: ({ position }) => {
      if (position) {
        const positionQuantity = new BigNumberInBase(position.quantity)

        const positionExist = positionStore.subaccountPositions.some(
          (p) => p.marketId === position.marketId
        )

        // filter out non-tradable markets
        if (
          !marketId &&
          !derivativeStore.activeMarketIds.includes(position.marketId)
        ) {
          return
        }

        if (positionExist) {
          if (positionQuantity.lte(0)) {
            // Position closed
            const subaccountPositions = [
              ...positionStore.subaccountPositions
            ].filter((p) => p.marketId !== position.marketId)

            positionStore.$patch({
              subaccountPositions,
              subaccountPositionsCount: subaccountPositions.length
            })
          } else {
            // Position updated
            const subaccountPositions = positionStore.subaccountPositions.map(
              (p) => {
                return p.marketId === position.marketId ? position : p
              }
            )

            positionStore.$patch({
              subaccountPositions,
              subaccountPositionsCount: subaccountPositions.length
            })
          }
        } else if (positionQuantity.gt(0)) {
          // Position added
          const subaccountPositions = [
            position,
            ...positionStore.subaccountPositions
          ]

          positionStore.$patch({
            subaccountPositions,
            subaccountPositionsCount: subaccountPositions.length
          })
        }
      }
    }
  })
}
