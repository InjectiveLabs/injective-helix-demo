import { defineStore } from 'pinia'
import { indexerDerivativesApi } from '@shared/Service'
import { Orderbook, PositionV2 } from '@injectivelabs/sdk-ts'
import {
  closePosition,
  closeAllPosition,
  addMarginToPosition,
  closePositionAndReduceOnlyOrders
} from '@/store/position/message'
import {
  streamSubaccountPositions,
  cancelSubaccountPositionsStream
} from '@/store/position/stream'
import { ActivityFetchOptions } from '@/types'

type OrderBookMap = Record<string, Orderbook>

type PositionStoreState = {
  orderbooks: OrderBookMap
  positions: PositionV2[]
}

const initialStateFactory = (): PositionStoreState => ({
  orderbooks: {} as OrderBookMap,
  positions: []
})

export const usePositionStore = defineStore('position', {
  state: (): PositionStoreState => initialStateFactory(),
  getters: {
    subaccountPositions: (state) => {
      const accountStore = useAccountStore()

      return state.positions.filter(
        ({ subaccountId }) => subaccountId === accountStore.subaccountId
      )
    }
  },
  actions: {
    closePosition,
    closeAllPosition,
    addMarginToPosition,
    closePositionAndReduceOnlyOrders,

    streamSubaccountPositions,
    cancelSubaccountPositionsStream,

    async fetchPositions() {
      const positionStore = usePositionStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (
        !sharedWalletStore.isUserConnected ||
        !sharedWalletStore.authZOrInjectiveAddress
      ) {
        return
      }

      const { positions } = await indexerDerivativesApi.fetchPositionsV2({
        address: sharedWalletStore.authZOrInjectiveAddress
      })

      derivativeStore.updateMarkPriceMapFromPosition(positions)

      positionStore.$patch({
        positions
      })
    },

    async fetchSubaccountPositions(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const accountStore = useAccountStore()
      const positionStore = usePositionStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = activityFetchOptions?.filters

      const { positions } = await indexerDerivativesApi.fetchPositionsV2({
        subaccountId: accountStore.subaccountId,
        marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
        direction: filters?.direction
      })

      derivativeStore.updateMarkPriceMapFromPosition(positions)

      const filteredExistingPositions = positionStore.positions.filter(
        (position) =>
          !positions.some(
            (p) =>
              p.marketId === position.marketId &&
              p.subaccountId === position.subaccountId
          )
      )

      positionStore.$patch({
        positions: [...filteredExistingPositions, ...positions]
      })
    },

    // Todo: @ivan verify if we still needs this
    // Fetching multiple market orderbooks for unrealized PnL calculation within a market page
    async fetchOpenPositionsMarketsOrderbook() {
      const accountStore = useAccountStore()
      const positionStore = usePositionStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      if (positionStore.subaccountPositions.length === 0) {
        return
      }

      const marketsOrderbook = await indexerDerivativesApi.fetchOrderbooksV2(
        positionStore.subaccountPositions.map((position) => position.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, { orderbook }, index) => {
          return {
            ...marketOrderbooks,
            [positionStore.subaccountPositions[index].marketId]: orderbook
          }
        },
        {} as OrderBookMap
      )

      positionStore.$patch({
        orderbooks: marketsOrderbookMap
      })
    }
  }
})
