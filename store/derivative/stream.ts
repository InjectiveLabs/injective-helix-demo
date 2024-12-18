import {
  OrderSide,
  OrderState,
  StreamOperation,
  TradeExecutionSide
} from '@injectivelabs/ts-types'
import {
  streamTrades as grpcStreamsTrades,
  cancelTradesStream as grpcCancelTradesStream,
  streamOrderbookUpdate as grpcStreamOrderbookUpdate,
  streamSubaccountOrders as grpcStreamsSubaccountOrders,
  streamSubaccountTrades as grpcStreamsSubaccountTrades,
  streamMarketsMarkPrices as grpcStreamMarketsMarkPrices,
  cancelMarketsMarkPrices as grpcCancelMarketsMarkPrices,
  cancelOrderbookUpdateStream as grpcCancelOrderbookUpdateStream,
  cancelSubaccountOrdersStream as grpcCancelSubaccountOrdersStream,
  cancelSubaccountTradesStream as grpcCancelSubaccountTradesStream,
  streamSubaccountOrderHistory as grpcStreamsSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream as grpcCancelSubaccountOrderHistoryStream
} from '@/app/client/streams/derivatives'
import { combineOrderbookRecords } from '@/app/utils/market'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export const cancelTradesStream = grpcCancelTradesStream
export const cancelMarketsMarkPrices = grpcCancelMarketsMarkPrices
export const cancelOrderbookUpdateStream = grpcCancelOrderbookUpdateStream
export const cancelSubaccountOrdersStream = grpcCancelSubaccountOrdersStream
export const cancelSubaccountTradesStream = grpcCancelSubaccountTradesStream
export const cancelSubaccountOrderHistoryStream =
  grpcCancelSubaccountOrderHistoryStream

export const streamOrderbookUpdate = ({
  marketId,
  onResetCallback
}: {
  marketId: string
  onResetCallback?: Function
}) => {
  const derivativeStore = useDerivativeStore()

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
      if (!derivativeStore.orderbook) {
        derivativeStore.$patch({
          orderbook
        })
      }

      const sequence = derivativeStore.orderbook?.sequence || 0

      /**
       * A sequence was skipped, refetch the orderbook snapshot
       **/
      if (orderbook.sequence !== sequence + 1) {
        return derivativeStore.fetchOrderbook(marketId)
      }

      /**
       * The current orderbook exists and we need to update it
       **/

      const newBuys = combineOrderbookRecords({
        isBuy: true,
        updatedRecords: orderbook.buys,
        currentRecords: derivativeStore.buys
      })
      const newSells = combineOrderbookRecords({
        isBuy: false,
        updatedRecords: orderbook.sells,
        currentRecords: derivativeStore.sells
      })

      derivativeStore.orderbook = {
        sequence: orderbook.sequence,
        buys: newBuys,
        sells: newSells
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
  const derivativeStore = useDerivativeStore()

  grpcStreamsTrades({
    marketId,
    onResetCallback,
    callback: ({ trade, operation }) => {
      if (!trade || trade.executionSide !== TradeExecutionSide.Taker) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert:
          derivativeStore.$patch({
            trades: [trade, ...derivativeStore.trades]
          })
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
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamsSubaccountOrderHistory({
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
            ...derivativeStore.subaccountOrderHistory.filter(
              (o) => order.orderHash !== o.orderHash
            )
          ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

          derivativeStore.$patch({
            subaccountOrderHistory,
            subaccountOrderHistoryCount: subaccountOrderHistory.length
          })

          break
        }
        case OrderState.Canceled: {
          if (order.orderHash) {
            const subaccountOrderHistory =
              derivativeStore.subaccountOrderHistory
                .map((o) => (order.orderHash === o.orderHash ? order : o))
                .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountOrderHistory,
              subaccountOrderHistoryCount: subaccountOrderHistory.length
            })
          }

          break
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
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamsSubaccountTrades({
    marketId,
    onResetCallback,
    subaccountId: accountStore.subaccountId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert: {
          const subaccountTrades = [
            trade,
            ...derivativeStore.subaccountTrades
          ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

          derivativeStore.$patch({
            subaccountTrades,
            subaccountTradesCount: subaccountTrades.length
          })

          break
        }

        case StreamOperation.Delete:
          {
            const subaccountTrades = [...derivativeStore.subaccountTrades]
              .filter((order) => order.orderHash !== trade.orderHash)
              .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountTrades,
              subaccountTradesCount: subaccountTrades.length
            })
          }
          break
        case StreamOperation.Update:
          if (trade.orderHash) {
            const subaccountTrades = [...derivativeStore.subaccountTrades]
              .map((order) =>
                order.orderHash === trade.orderHash ? trade : order
              )
              .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountTrades,
              subaccountTradesCount: subaccountTrades.length
            })
          }

          break
      }
    }
  })
}

export const streamSubaccountOrders = ({
  marketId,
  onResetCallback
}: {
  marketId?: string
  onResetCallback?: Function
}) => {
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamsSubaccountOrders({
    marketId,
    onResetCallback,
    subaccountId: accountStore.subaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      const isConditional = [
        OrderSide.TakeBuy,
        OrderSide.TakeSell,
        OrderSide.StopBuy,
        OrderSide.StopSell
      ].includes(order.orderType as OrderSide)

      switch (order.state) {
        case OrderState.Booked:
        case OrderState.Unfilled:
        case OrderState.PartialFilled: {
          if (isConditional) {
            const subaccountConditionalOrders = [
              order,
              ...derivativeStore.subaccountConditionalOrders.filter(
                (o) => o.orderHash !== order.orderHash
              )
            ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountConditionalOrders,
              subaccountConditionalOrdersCount:
                subaccountConditionalOrders.length
            })
          } else {
            const subaccountOrders = [
              order,
              ...derivativeStore.subaccountOrders.filter(
                (o) => o.orderHash !== order.orderHash
              )
            ].slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountOrders,
              subaccountOrdersCount: subaccountOrders.length
            })
          }

          break
        }
        case OrderState.Triggered:
        case OrderState.Canceled:
        case OrderState.Filled: {
          if (isConditional) {
            const subaccountConditionalOrders = [
              ...derivativeStore.subaccountConditionalOrders
            ]
              .filter((o) => o.orderHash !== order.orderHash)
              .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountConditionalOrders,
              subaccountConditionalOrdersCount:
                subaccountConditionalOrders.length
            })
          } else {
            const subaccountOrders = [...derivativeStore.subaccountOrders]
              .filter((o) => o.orderHash !== order.orderHash)
              .slice(0, TRADE_MAX_SUBACCOUNT_ARRAY_SIZE)

            derivativeStore.$patch({
              subaccountOrders,
              subaccountOrdersCount: subaccountOrders.length
            })
          }

          break
        }
      }
    }
  })
}

export const streamMarketsMarkPrices = (
  {
    marketIds,
    onResetCallback
  }: { marketIds: string[]; onResetCallback?: Function } = {
    marketIds: []
  }
) => {
  const derivativeStore = useDerivativeStore()

  grpcStreamMarketsMarkPrices({
    marketIds,
    onResetCallback,
    callback: (marketMarkPrice) => {
      if (!marketMarkPrice.price || !marketMarkPrice.marketId) {
        return
      }

      derivativeStore.marketMarkPriceMap = {
        ...derivativeStore.marketMarkPriceMap,
        [marketMarkPrice.marketId]: {
          ...marketMarkPrice,
          timestamp: parseInt(marketMarkPrice.timestamp, 10)
        }
      }
    }
  })
}
