import {
  streamSubaccountOrderHistory as grpcStreamsDerivativeSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamsDerivativeSubaccountTrades
} from '@/app/client/streams/derivatives'
import {
  streamSubaccountOrderHistory as grpcStreamSpotSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamSpotSubaccountTrade
} from '@/app/client/streams/spot'

export const streamDerivativeSubaccountOrderHistory = (marketId?: string) => {
  const activityStore = useActivityStore()
  const derivativeStore = useDerivativeStore()
  const { subaccountId } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountOrderHistory({
    marketId,
    subaccountId,
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

      activityStore.$patch({ latestDerivativeOrderHistory: order })
    }
  })
}

export const streamDerivativeSubaccountTrades = (marketId?: string) => {
  const activityStore = useActivityStore()
  const derivativeStore = useDerivativeStore()
  const { subaccountId } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountTrades({
    marketId,
    subaccountId,
    callback: ({ trade }) => {
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

      activityStore.$patch({ latestDerivativeTrade: trade })
    }
  })
}

export const streamSpotSubaccountOrderHistory = (marketId?: string) => {
  const activityStore = useActivityStore()
  const spotStore = useSpotStore()

  const { subaccountId } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  grpcStreamSpotSubaccountOrderHistory({
    subaccountId,
    marketId,
    callback: ({ order }) => {
      if (!order) {
        return
      }

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(order.marketId)) {
        return
      }

      activityStore.$patch({
        latestSpotOrderHistory: order
      })
    }
  })
}

export const streamSpotSubaccountTrades = (marketId?: string) => {
  const activityStore = useActivityStore()
  const spotStore = useSpotStore()

  const { subaccountId } = useAccountStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !subaccountId) {
    return
  }

  grpcStreamSpotSubaccountTrade({
    marketId,
    subaccountId,
    callback: ({ trade }) => {
      if (!trade) {
        return
      }

      // filter out non-tradable markets
      if (!marketId && !spotStore.activeMarketIds.includes(trade.marketId)) {
        return
      }

      activityStore.$patch({
        latestSpotTrade: trade
      })
    }
  })
}
