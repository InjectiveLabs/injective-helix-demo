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
  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountOrderHistory({
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

      activityStore.$patch({ latestDerivativeOrderHistory: order })
    }
  })
}

export const streamDerivativeSubaccountTrades = (marketId?: string) => {
  const activityStore = useActivityStore()
  const derivativeStore = useDerivativeStore()
  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamsDerivativeSubaccountTrades({
    marketId,
    subaccountId: defaultSubaccountId,
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

  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamSpotSubaccountOrderHistory({
    subaccountId: defaultSubaccountId,
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

  const { defaultSubaccountId } = useBankStore()
  const { isUserWalletConnected } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId) {
    return
  }

  grpcStreamSpotSubaccountTrade({
    marketId,
    subaccountId: defaultSubaccountId,
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
