import {
  streamSubaccountOrderHistory as grpcStreamsDerivativeSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamsDerivativeSubaccountTrades
} from '@/app/client/streams/derivatives'
import {
  streamSubaccountOrderHistory as grpcStreamSpotSubaccountOrderHistory,
  streamSubaccountTrades as grpcStreamSpotSubaccountTrade
} from '@/app/client/streams/spot'

export const streamDerivativeSubaccountOrderHistory = (marketId?: string) => {
  const accountStore = useAccountStore()
  const activityStore = useActivityStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountOrderHistory({
    marketId,
    subaccountId: accountStore.subaccountId,
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
  const accountStore = useAccountStore()
  const activityStore = useActivityStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountTrades({
    marketId,
    subaccountId: accountStore.subaccountId,
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
  const spotStore = useSpotStore()
  const activityStore = useActivityStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamSpotSubaccountOrderHistory({
    subaccountId: accountStore.subaccountId,
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
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()
  const activityStore = useActivityStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
    return
  }

  grpcStreamSpotSubaccountTrade({
    marketId,
    subaccountId: accountStore.subaccountId,
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
