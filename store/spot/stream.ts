import {
  OrderState,
  StreamOperation,
  TradeExecutionSide
} from '@injectivelabs/ts-types'
import {
  streamTrades as grpcStreamTrades,
  cancelTradesStream as grpcCancelTradesStream,
  streamOrderbookUpdate as grpcStreamOrderbookUpdate,
  streamSubaccountTrades as grpcStreamSubaccountTrade,
  streamSubaccountOrders as grpcStreamSubaccountOrders,
  cancelOrderbookUpdateStream as grpcCancelOrderbookUpdateStream,
  cancelSubaccountOrdersStream as grpcCancelSubaccountOrdersStream,
  cancelSubaccountTradesStream as grpcCancelSubaccountTradesStream,
  streamSubaccountOrderHistory as grpcStreamSubaccountOrderHistory,
  cancelSubaccountOrdersHistoryStream as grpcCancelSubaccountOrdersHistoryStream
} from '@/app/client/streams/spot'
import { combineOrderbookRecords } from '@/app/utils/market'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export const cancelTradesStream = grpcCancelTradesStream
export const cancelOrderbookUpdateStream = grpcCancelOrderbookUpdateStream
export const cancelSubaccountOrdersStream = grpcCancelSubaccountOrdersStream
export const cancelSubaccountTradesStream = grpcCancelSubaccountTradesStream
export const cancelSubaccountOrdersHistoryStream =
  grpcCancelSubaccountOrdersHistoryStream

export const streamOrderbookUpdate = ({
  marketId,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
}) => {
  const spotStore = useSpotStore()

  grpcStreamOrderbookUpdate({
    marketId,
    onResetCallback,
    callback: ({ orderbook }) => {
      if (!orderbook) {
        return
      }

      /**
       * The current orderbook doesn't exist
       **/
      if (!spotStore.orderbook) {
        spotStore.orderbook = orderbook
      }

      const sequence = spotStore.orderbook?.sequence || 0

      /**
       * A sequence was skipped, refetch the orderbook snapshot
       **/
      if (orderbook.sequence !== sequence + 1) {
        return spotStore.fetchOrderbook(marketId)
      }

      /**
       * The current orderbook exists and we need to update it
       **/
      const newBuys = combineOrderbookRecords({
        isBuy: true,
        currentRecords: spotStore.buys,
        updatedRecords: orderbook.buys
      })

      const newSells = combineOrderbookRecords({
        isBuy: false,
        currentRecords: spotStore.sells,
        updatedRecords: orderbook.sells
      })

      spotStore.orderbook = {
        buys: newBuys,
        sells: newSells,
        sequence: orderbook.sequence
      }
    }
  })
}

export const streamTrades = ({
  marketId,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
}) => {
  const spotStore = useSpotStore()

  grpcStreamTrades({
    marketId,
    onResetCallback,
    callback: ({ trade, operation }) => {
      if (!trade || trade.executionSide !== TradeExecutionSide.Taker) {
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

export const streamSubaccountOrders = ({
  marketId,
  subaccountId,
  onResetCallback
}: {
  marketId?: string
  subaccountId?: string
  onResetCallback?: Function
}) => {
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !sharedWalletStore.isUserConnected ||
    (!accountStore.subaccountId && !subaccountId)
  ) {
    return
  }

  grpcStreamSubaccountOrders({
    marketId,
    onResetCallback,
    subaccountId: subaccountId || accountStore.subaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      switch (order.state) {
        case OrderState.Booked:
        case OrderState.Unfilled:
        case OrderState.PartialFilled: {
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
        case OrderState.Canceled:
        case OrderState.Filled: {
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

export const streamSubaccountOrderHistory = ({
  marketId,
  onResetCallback
}: {
  marketId?: string
  onResetCallback?: Function
}) => {
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamSubaccountOrderHistory({
    marketId,
    onResetCallback,
    subaccountId: accountStore.subaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      switch (order.state) {
        case OrderState.Booked:
        case OrderState.Filled:
        case OrderState.Unfilled:
        case OrderState.PartialFilled: {
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
        case OrderState.Canceled: {
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

export const streamSubaccountTrades = ({
  marketId,
  onResetCallback
}: {
  marketId?: string
  onResetCallback?: Function
}) => {
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamSubaccountTrade({
    marketId,
    onResetCallback,
    subaccountId: accountStore.subaccountId,
    callback: ({ trade, operation }) => {
      if (!trade) {
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
