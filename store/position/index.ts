import { defineStore } from 'pinia'
import { UiDerivativeOrderbook, UiPosition } from '@injectivelabs/sdk-ui-ts'
import { useDerivativeStore } from '../derivative'
import { indexerDerivativesApi } from '@/app/Services'
import { ActivityFetchOptions } from '@/types'
import {
  addMarginToPosition,
  closePosition,
  closeAllPosition,
  closePositionAndReduceOnlyOrders
} from '@/store/position/message'
import {
  streamSubaccountPositions,
  cancelSubaccountPositionsStream
} from '@/store/position/stream'

type OrderBookMap = Record<string, UiDerivativeOrderbook>

type PositionStoreState = {
  orderbooks: OrderBookMap
  subaccountPositions: UiPosition[]
  subaccountPositionsCount: number
}

const initialStateFactory = (): PositionStoreState => ({
  orderbooks: {} as OrderBookMap,
  subaccountPositions: [],
  subaccountPositionsCount: 0
})

export const usePositionStore = defineStore('position', {
  state: (): PositionStoreState => initialStateFactory(),
  actions: {
    addMarginToPosition,
    closePosition,
    closeAllPosition,
    closePositionAndReduceOnlyOrders,

    cancelSubaccountPositionsStream,
    streamSubaccountPositions,

    async fetchSubaccountPositions(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const derivativeStore = useDerivativeStore()
      const positionStore = usePositionStore()
      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const filters = activityFetchOptions?.filters

      const { positions, pagination } =
        await indexerDerivativesApi.fetchPositions({
          subaccountId,
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          direction: filters?.direction
        })

      positionStore.$patch({
        subaccountPositions: positions,
        subaccountPositionsCount: pagination.total
      })
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within
    async fetchMarketsOrderbook() {
      const positionStore = usePositionStore()

      const { markets } = useDerivativeStore()
      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      if (markets.length === 0) {
        return
      }

      const marketsOrderbook = await indexerDerivativesApi.fetchOrderbooksV2(
        markets.map((market) => market.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, { orderbook }, index) => {
          return {
            ...marketOrderbooks,
            [markets[index].marketId]: orderbook
          }
        },
        {} as OrderBookMap
      )

      positionStore.$patch({
        orderbooks: marketsOrderbookMap
      })
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within a market page
    async fetchOpenPositionsMarketsOrderbook() {
      const positionStore = usePositionStore()

      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      const { subaccountPositions } = positionStore

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      if (subaccountPositions.length === 0) {
        return
      }

      const marketsOrderbook = await indexerDerivativesApi.fetchOrderbooksV2(
        subaccountPositions.map((position) => position.marketId)
      )
      const marketsOrderbookMap = marketsOrderbook.reduce(
        (marketOrderbooks, { orderbook }, index) => {
          return {
            ...marketOrderbooks,
            [subaccountPositions[index].marketId]: orderbook
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
