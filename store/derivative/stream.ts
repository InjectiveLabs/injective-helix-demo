import {
  DerivativeOrderSide,
  DerivativeOrderState
} from '@injectivelabs/sdk-ts'
import { StreamOperation } from '@injectivelabs/ts-types'
import {
  streamTrades as grpcStreamsTrades,
  streamOrderbookUpdate as grpcStreamOrderbookUpdate,
  streamSubaccountOrders as grpcStreamsSubaccountOrders,
  streamSubaccountTrades as grpcStreamsSubaccountTrades,
  streamMarketsMarkPrices as grpcStreamMarketsMarkPrices,
  cancelMarketsMarkPrices as grpcCancelMarketsMarkPrices,
  cancelSubaccountOrdersStream as grpcCancelSubaccountOrdersStream,
  cancelSubaccountTradesStream as grpcCancelSubaccountTradesStream,
  streamSubaccountOrderHistory as grpcStreamsSubaccountOrderHistory,
  cancelSubaccountOrderHistoryStream as grpcCancelSubaccountOrderHistoryStream
} from '@/app/client/streams/derivatives'
import { combineOrderbookRecords } from '@/app/utils/market'
import { TRADE_MAX_SUBACCOUNT_ARRAY_SIZE } from '@/app/utils/constants'

export const cancelMarketsMarkPrices = grpcCancelMarketsMarkPrices
export const cancelSubaccountOrdersStream = grpcCancelSubaccountOrdersStream
export const cancelSubaccountTradesStream = grpcCancelSubaccountTradesStream
export const cancelSubaccountOrderHistoryStream =
  grpcCancelSubaccountOrderHistoryStream

export const streamOrderbookUpdate = (marketId: string) => {
  const derivativeStore = useDerivativeStore()

  grpcStreamOrderbookUpdate({
    marketId,
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
       * The current exists and we need to update it
       **/
      if (sequence < orderbook.sequence) {
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
    }
  })
}

export const streamTrades = (marketId: string) => {
  const derivativeStore = useDerivativeStore()

  grpcStreamsTrades({
    marketId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      // filter out non-tradable markets
      if (
        !marketId &&
        !derivativeStore.activeMarketIds.includes(trade.marketId)
      ) {
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

export const streamSubaccountOrderHistory = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamsSubaccountOrderHistory({
    marketId,
    subaccountId: defaultSubaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      // filter out non-tradable markets
      if (
        !marketId &&
        !derivativeStore.activeMarketIds.includes(order.marketId)
      ) {
        return
      }

      switch (order.state) {
        case DerivativeOrderState.Booked:
        case DerivativeOrderState.Filled:
        case DerivativeOrderState.Unfilled:
        case DerivativeOrderState.PartialFilled: {
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
        case DerivativeOrderState.Canceled: {
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

export const streamSubaccountTrades = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamsSubaccountTrades({
    marketId,
    subaccountId: defaultSubaccountId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      // filter out non-tradable markets
      if (
        !marketId &&
        !derivativeStore.activeMarketIds.includes(trade.marketId)
      ) {
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

export const streamSubaccountOrders = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamsSubaccountOrders({
    marketId,
    subaccountId: defaultSubaccountId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      // filter out non-tradable markets
      if (
        !marketId &&
        !derivativeStore.activeMarketIds.includes(order.marketId)
      ) {
        return
      }

      const isConditional = [
        DerivativeOrderSide.TakeBuy,
        DerivativeOrderSide.TakeSell,
        DerivativeOrderSide.StopBuy,
        DerivativeOrderSide.StopSell
      ].includes(order.orderType as DerivativeOrderSide)

      switch (order.state) {
        case DerivativeOrderState.Booked:
        case DerivativeOrderState.Unfilled:
        case DerivativeOrderState.PartialFilled: {
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
        case DerivativeOrderState.Triggered:
        case DerivativeOrderState.Canceled:
        case DerivativeOrderState.Filled: {
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

export const streamMarketsMarkPrices = () => {
  const derivativeStore = useDerivativeStore()

  grpcStreamMarketsMarkPrices({
    marketIds: derivativeStore.activeMarketIds,
    callback: (marketMarkPrice) => {
      if (!marketMarkPrice.price || !marketMarkPrice.marketId) {
        return
      }

      derivativeStore.marketMarkPriceMap = {
        ...derivativeStore.marketMarkPriceMap,
        [marketMarkPrice.marketId]: marketMarkPrice
      }
    }
  })
}
