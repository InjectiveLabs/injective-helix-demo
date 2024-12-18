import { BigNumberInBase } from '@injectivelabs/utils'
import {
  streamSubaccountPositions as grpcStreamSubaccountPositions,
  cancelSubaccountPositionsStream as grpcCancelSubaccountPositionsStream
} from '@/app/client/streams/derivatives'

export const cancelAccountPositionsStream = grpcCancelSubaccountPositionsStream

export const streamAccountPositions = ({
  onResetCallback
}: { onResetCallback?: Function } = {}) => {
  const accountStore = useAccountStore()
  const positionStore = usePositionStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamSubaccountPositions({
    onResetCallback,
    address: sharedWalletStore.authZOrInjectiveAddress,
    callback: ({ position }) => {
      if (position) {
        const positionQuantity = new BigNumberInBase(position.quantity)

        const positionExist = positionStore.positions.some(
          (p) =>
            p.marketId === position.marketId &&
            p.subaccountId === position.subaccountId
        )

        // filter out non-tradable markets
        if (!derivativeStore.activeMarketIds.includes(position.marketId)) {
          return
        }

        if (positionExist) {
          if (positionQuantity.lte(0)) {
            // Position closed
            const positions = positionStore.positions.filter(
              (p) =>
                !(
                  p.marketId === position.marketId &&
                  p.subaccountId === position.subaccountId
                )
            )

            positionStore.$patch({
              positions
            })
          } else {
            // Position updated
            const positions = positionStore.positions.map((p) => {
              return p.marketId === position.marketId &&
                p.subaccountId === position.subaccountId
                ? position
                : p
            })

            positionStore.$patch({
              positions
            })
          }
        } else if (positionQuantity.gt(0)) {
          // Position added

          const positions = [position, ...positionStore.positions]

          positionStore.$patch({
            positions
          })
        }
      }
    }
  })
}
