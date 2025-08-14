import { defineStore } from 'pinia'
import { indexerDerivativesApi } from '@shared/Service'
import {
  streamAccountPositions,
  cancelAccountPositionsStream
} from '@/store/position/stream'
import {
  closePosition,
  closeAllPosition,
  addMarginToPosition,
  addMarginToSubaccountPosition
} from '@/store/position/message'
import type { ActivityFetchOptions } from '@/types'
import type { Orderbook, PositionV2 } from '@injectivelabs/sdk-ts'

type OrderBookMap = Record<string, Orderbook>

type PositionStoreState = {
  positions: PositionV2[]
  orderbooks: OrderBookMap
}

const initialStateFactory = (): PositionStoreState => ({
  orderbooks: {} as OrderBookMap,
  positions: []
})

export const usePositionStore = defineStore('position', {
  state: (): PositionStoreState => initialStateFactory(),
  getters: {
    positionsBySubaccountId: (state) => (subaccountId: string) => {
      const derivativeStore = useDerivativeStore()

      return state.positions.filter(
        (position) =>
          position.subaccountId === subaccountId &&
          derivativeStore.activeMarketIds.includes(position.marketId)
      )
    },

    subaccountPositions: (state) => {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()

      return state.positions.filter(
        ({ marketId, subaccountId }) =>
          subaccountId === accountStore.subaccountId &&
          derivativeStore.activeMarketIds.includes(marketId)
      )
    }
  },
  actions: {
    closePosition,
    closeAllPosition,
    addMarginToPosition,
    addMarginToSubaccountPosition,

    streamAccountPositions,
    cancelAccountPositionsStream,

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
