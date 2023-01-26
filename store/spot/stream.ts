import { SpotOrderState } from '@injectivelabs/sdk-ts'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  cancelOrderbookStream as grpcCancelOrderbookStream,
  cancelTradesStream as grpcCancelTradesStream,
  streamOrderbook as grpcStreamOrderbook,
  streamTrades as grpcStreamTrades,
  streamSubaccountOrders as grpcStreamSubaccountOrders,
  streamSubaccountOrderHistory as grpcStreamSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamSubaccountTrade
} from '@/app/client/streams/spot'

export const cancelOrderbookStream = grpcCancelOrderbookStream
export const cancelTradesStream = grpcCancelTradesStream

export const streamOrderbook = (marketId: string) => {
  const spotStore = useSpotStore()

  grpcStreamOrderbook({
    marketId,
    callback: ({ orderbook }) => {
      if (!orderbook) {
        return
      }

      spotStore.$patch({
        orderbook
      })
    }
  })
}

export const streamTrades = (marketId: string) => {
  const spotStore = useSpotStore()

  grpcStreamTrades({
    marketId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert:
          spotStore.$patch({
            trades: [trade, ...spotStore.trades]
          })
      }
    }
  })
}

export const streamSubaccountOrders = () => {
  const spotStore = useSpotStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountOrders({
    subaccountId: subaccount.subaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      switch (order.state) {
        case SpotOrderState.Booked:
        case SpotOrderState.Unfilled:
        case SpotOrderState.PartialFilled: {
          const subaccountOrders = [
            order,
            ...spotStore.subaccountOrders.filter(
              (o) => o.orderHash !== order.orderHash
            )
          ]

          spotStore.$patch({
            subaccountOrders,
            subaccountOrdersCount: subaccountOrders.length
          })

          break
        }
        case SpotOrderState.Canceled:
        case SpotOrderState.Filled: {
          const subaccountOrders = spotStore.subaccountOrders.filter(
            (o) => o.orderHash !== order.orderHash
          )

          spotStore.$patch({
            subaccountOrders,
            subaccountOrdersCount: subaccountOrders.length
          })

          break
        }
      }
    }
  })
}

export const streamSubaccountOrderHistory = () => {
  const spotStore = useSpotStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountOrderHistory({
    subaccountId: subaccount.subaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      switch (order.state) {
        case SpotOrderState.Booked:
        case SpotOrderState.Filled:
        case SpotOrderState.Unfilled:
        case SpotOrderState.PartialFilled: {
          const subaccountOrderHistory = [
            order,
            ...spotStore.subaccountOrderHistory.filter(
              (o) => o.orderHash !== order.orderHash
            )
          ]

          spotStore.$patch({
            subaccountOrderHistory,
            subaccountOrderHistoryCount: subaccountOrderHistory.length
          })

          break
        }
        case SpotOrderState.Canceled: {
          if (order.orderHash) {
            const subaccountOrderHistory = spotStore.subaccountOrderHistory.map(
              (o) => (o.orderHash === order.orderHash ? order : o)
            )

            spotStore.$patch({
              subaccountOrderHistory,
              subaccountOrderHistoryCount: subaccountOrderHistory.length
            })

            break
          }
        }
      }
    }
  })
}

export const streamSubaccountTrades = (marketId: string) => {
  const spotStore = useSpotStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountTrade({
    marketId,
    subaccountId: subaccount.subaccountId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert: {
          const subaccountTrades = [trade, ...spotStore.subaccountTrades]

          spotStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }
        case StreamOperation.Delete: {
          const subaccountTrades = spotStore.subaccountTrades.filter(
            (order) => order.orderHash !== trade.orderHash
          )

          spotStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }
        case StreamOperation.Update: {
          const subaccountTrades = spotStore.subaccountTrades.map((t) =>
            t.orderHash === trade.orderHash ? trade : t
          )

          spotStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }
      }
    }
  })
}
