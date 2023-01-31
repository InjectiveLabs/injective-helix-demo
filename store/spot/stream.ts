import { SpotOrderState } from '@injectivelabs/sdk-ts'
import { StreamOperation } from '@injectivelabs/ts-types'
import { BigNumber } from '@injectivelabs/utils'
import {
  streamTrades as grpcStreamTrades,
  streamOrderbook as grpcStreamOrderbook,
  streamOrderbookV2 as grpcStreamOrderbookV2,
  cancelTradesStream as grpcCancelTradesStream,
  cancelOrderbookStream as grpcCancelOrderbookStream,
  streamSubaccountTrades as grpcStreamSubaccountTrade,
  streamSubaccountOrders as grpcStreamSubaccountOrders,
  cancelOrderbookV2Stream as grpcCancelOrderbookV2Stream,
  cancelSubaccountOrdersStream as grpcCancelSubaccountOrdersStream,
  cancelSubaccountTradesStream as grpcCancelSubaccountTradesStream,
  streamSubaccountOrderHistory as grpcStreamSubaccountOrderHistory,
  cancelSubaccountOrdersHistoryStream as grpcCancelSubaccountOrdersHistoryStream
} from '@/app/client/streams/spot'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'
import { updateOrderbookRecord } from '@/app/utils/market'

export const cancelTradesStream = grpcCancelTradesStream
export const cancelOrderbookStream = grpcCancelOrderbookStream
export const cancelOrderbookV2Stream = grpcCancelOrderbookV2Stream
export const cancelSubaccountOrdersStream = grpcCancelSubaccountOrdersStream
export const cancelSubaccountTradesStream = grpcCancelSubaccountTradesStream
export const cancelSubaccountOrdersHistoryStream =
  grpcCancelSubaccountOrdersHistoryStream

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

export const streamOrderbookV2 = (marketId: string) => {
  const spotStore = useSpotStore()

  grpcStreamOrderbookV2({
    marketId,
    callback: ({ orderbook }) => {
      if (!orderbook) {
        return
      }

      /**
       * The current orderbook doesn't exist
       **/
      if (!spotStore.orderbookV2) {
        spotStore.$patch({
          orderbookV2: orderbook
        })
      }

      const sequence = spotStore.orderbookV2?.sequence || 0

      /**
       * 1. if new exists in current, update quantity in current,
       * 2. if new exists in current and quantity is 0, delete from current
       * 3. If new doesn't exist in current, add to current
       **/
      if (sequence < orderbook.sequence) {
        const newBuys = updateOrderbookRecord(
          spotStore.buys,
          orderbook.buys
        ).sort((a, b) => new BigNumber(b.price).minus(a.price).toNumber())
        const newSells = updateOrderbookRecord(
          spotStore.sells,
          orderbook.sells
        ).sort((a, b) => new BigNumber(a.price).minus(b.price).toNumber())

        spotStore.$patch({
          orderbookV2: {
            sequence: orderbook.sequence,
            buys: newBuys,
            sells: newSells
          }
        })
      }
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

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(trade.marketId)) {
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

export const streamSubaccountOrders = (marketId?: string) => {
  const spotStore = useSpotStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountOrders({
    subaccountId: subaccount.subaccountId,
    marketId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(order.marketId)) {
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
          ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

          spotStore.$patch({
            subaccountOrders,
            subaccountOrdersCount: subaccountOrders.length
          })

          break
        }
        case SpotOrderState.Canceled:
        case SpotOrderState.Filled: {
          const subaccountOrders = spotStore.subaccountOrders
            .filter((o) => o.orderHash !== order.orderHash)
            .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

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

export const streamSubaccountOrderHistory = (marketId?: string) => {
  const spotStore = useSpotStore()

  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamSubaccountOrderHistory({
    subaccountId: subaccount.subaccountId,
    marketId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(order.marketId)) {
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
          ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

          spotStore.$patch({
            subaccountOrderHistory,
            subaccountOrderHistoryCount: subaccountOrderHistory.length
          })

          break
        }
        case SpotOrderState.Canceled: {
          if (order.orderHash) {
            const subaccountOrderHistory = spotStore.subaccountOrderHistory
              .map((o) => (o.orderHash === order.orderHash ? order : o))
              .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

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

export const streamSubaccountTrades = (marketId?: string) => {
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

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(trade.marketId)) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert: {
          const subaccountTrades = [trade, ...spotStore.subaccountTrades].slice(
            0,
            TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
          )

          spotStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }
        case StreamOperation.Delete: {
          const subaccountTrades = spotStore.subaccountTrades
            .filter((order) => order.orderHash !== trade.orderHash)
            .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

          spotStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }
        case StreamOperation.Update: {
          const subaccountTrades = spotStore.subaccountTrades
            .map((t) => (t.orderHash === trade.orderHash ? trade : t))
            .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

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
