import { StreamOperation } from '@injectivelabs/ts-types'
import {
  DerivativeOrderSide,
  DerivativeOrderState
} from '@injectivelabs/sdk-ts'
import {
  MarketType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  streamOrderbook as grpcStreamsOrderbook,
  streamTrades as grpcStreamsTrades,
  streamSubaccountOrders as grpcStreamsSubaccountOrders,
  streamSubaccountOrderHistory as grpcStreamsSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamsSubaccountTrades,
  streamMarketMarkPrice as grpcStreamsMarketMarkPrice,
  cancelSubaccountOrderHistoryStream as grpcCancelSubaccountOrderHistoryStream,
  cancelSubaccountOrdersStream as grpcCancelSubaccountOrdersStream,
  cancelSubaccountTradesStream as grpcCancelSubaccountTradesStream
} from '@/app/client/streams/derivatives'

export const streamOrderbook = (marketId: string) => {
  const derivativeStore = useDerivativeStore()

  grpcStreamsOrderbook({
    marketId,
    callback: ({ orderbook }) => {
      if (!orderbook) {
        return
      }

      derivativeStore.$patch({
        orderbook
      })
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

      switch (operation) {
        case StreamOperation.Insert:
          derivativeStore.$patch({
            trades: [trade, ...derivativeStore.trades]
          })
      }
    }
  })
}

export const cancelSubaccountOrdersStream = () => {
  grpcCancelSubaccountOrdersStream()
}

export const streamSubaccountOrderHistory = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamsSubaccountOrders({
    marketId,
    subaccountId: subaccount.subaccountId,
    callback: ({ order }) => {
      if (!order) {
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
        case DerivativeOrderState.Filled:
        case DerivativeOrderState.Unfilled:
        case DerivativeOrderState.PartialFilled: {
          if (isConditional) {
            const subaccountConditionalOrders =
              derivativeStore.subaccountConditionalOrders.filter(
                (o) => o.orderHash !== order.orderHash
              )

            derivativeStore.$patch({
              subaccountConditionalOrders: [
                order,
                ...subaccountConditionalOrders
              ]
            })
          } else {
            const subaccountOrders = [
              ...derivativeStore.subaccountOrders
            ].filter((o) => o.orderHash !== order.orderHash)

            derivativeStore.$patch({
              subaccountOrders: [order, ...subaccountOrders]
            })
          }

          break
        }
        case DerivativeOrderState.Canceled: {
          if (order.orderHash) {
            const subaccountOrders = derivativeStore.subaccountOrders.map((o) =>
              o.orderHash === order.orderHash ? order : o
            )

            derivativeStore.$patch({
              subaccountOrders
            })
          }
          break
        }
      }
    }
  })
}

export const cancelSubaccountOrderHistoryStream = () =>
  grpcCancelSubaccountOrderHistoryStream()

export const streamSubaccountTrades = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamsSubaccountTrades({
    marketId,
    subaccountId: subaccount.subaccountId,
    callback: ({ trade, operation }) => {
      if (!trade) {
        return
      }

      switch (operation) {
        case StreamOperation.Insert:
          derivativeStore.$patch({
            subaccountTrades: [trade, ...derivativeStore.subaccountTrades]
          })

          break
        case StreamOperation.Delete:
          {
            const subaccountTrades = [
              ...derivativeStore.subaccountTrades
            ].filter((order) => order.orderHash !== trade.orderHash)

            derivativeStore.$patch({
              subaccountTrades
            })
          }
          break
        case StreamOperation.Update:
          if (trade.orderHash) {
            const subaccountTrades = [...derivativeStore.subaccountTrades].map(
              (order) => (order.orderHash === trade.orderHash ? trade : order)
            )

            derivativeStore.$patch({
              subaccountTrades
            })
          }

          break
      }
    }
  })
}

export const streamSubaccountOrders = (marketId?: string) => {
  const derivativeStore = useDerivativeStore()
  const { subaccount } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccount) {
    return
  }

  grpcStreamsSubaccountOrderHistory({
    marketId,
    subaccountId: subaccount.subaccountId,
    callback: ({ order }) => {
      if (!order) {
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
            const subaccountOrderHistory = [
              ...derivativeStore.subaccountConditionalOrders
            ].filter((o) => o.orderHash !== order.orderHash)

            derivativeStore.$patch({
              subaccountOrderHistory: [order, ...subaccountOrderHistory]
            })
          } else {
            const subaccountOrderHistory = [
              ...derivativeStore.subaccountOrderHistory
            ].filter((o) => o.orderHash !== order.orderHash)

            derivativeStore.$patch({
              subaccountOrderHistory: [order, ...subaccountOrderHistory]
            })
          }

          break
        }
        case DerivativeOrderState.Canceled:
        case DerivativeOrderState.Filled: {
          if (isConditional) {
            const subaccountConditionalOrders = [
              ...derivativeStore.subaccountConditionalOrders
            ].filter((o) => o.orderHash !== order.orderHash)

            derivativeStore.$patch({
              subaccountConditionalOrders
            })
          } else {
            const subaccountOrders = [
              ...derivativeStore.subaccountOrders
            ].filter((o) => o.orderHash !== order.orderHash)

            derivativeStore.$patch({
              subaccountOrders
            })
          }

          break
        }
      }
    }
  })
}

export const streamMarketMarkPrices = (market: UiDerivativeMarketWithToken) => {
  const derivativeStore = useDerivativeStore()

  if (market.subType === MarketType.BinaryOptions) {
    return
  }

  grpcStreamsMarketMarkPrice({
    market,
    callback: ({ price, operation }) => {
      if (!price) {
        return
      }

      switch (operation) {
        case StreamOperation.Update:
          derivativeStore.$patch({ marketMarkPrice: price })
      }
    }
  })
}

export const cancelSubaccountTradesStream = () =>
  grpcCancelSubaccountTradesStream()
