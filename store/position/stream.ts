import { BigNumberInBase } from '@injectivelabs/utils'
import {
  streamSubaccountPositions as grpcStreamSubaccountPositions,
  cancelSubaccountPositionsStream as grpcCancelSubaccountStream
} from '@/app/client/streams/derivatives'

export const cancelSubaccountPositionsStream = grpcCancelSubaccountStream

export const streamSubaccountPositions = (marketId?: string) => {
  const positionStore = usePositionStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountPositions({
    subaccountId: subaccount.subaccountId,
    marketId,
    callback: ({ position }) => {
      if (position) {
        const positionQuantity = new BigNumberInBase(position.quantity)

        const positionExist = positionStore.subaccountPositions.some(
          (p) => p.marketId === position.marketId
        )

        /**
         * Position has been closed
         */
        if (positionExist) {
          if (positionQuantity.lte(0)) {
            const subaccountPositions = [
              ...positionStore.subaccountPositions
            ].filter((p) => p.marketId !== position.marketId)

            positionStore.$patch({
              subaccountPositions,
              subaccountPositionsCount: subaccountPositions.length
            })
          } else {
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
