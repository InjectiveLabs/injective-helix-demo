import { defineStore } from 'pinia'
import { usdtToken } from '@shared/data/token'
import { BigNumberInWei } from '@injectivelabs/utils'
import { indexerDerivativesApi } from '@shared/Service'
import { Orderbook, Position, PositionV2 } from '@injectivelabs/sdk-ts'
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
import { ActivityFetchOptions, MarketMarkPriceMap } from '@/types'

type OrderBookMap = Record<string, Orderbook>

type PositionStoreState = {
  orderbooks: OrderBookMap
  positions: PositionV2[] /** for account portfolio calculation */
  subaccountPositions: Position[]
  subaccountPositionsCount: number
}

const initialStateFactory = (): PositionStoreState => ({
  orderbooks: {} as OrderBookMap,
  positions: [],
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

    async fetchPositions() {
      const walletStore = useSharedWalletStore()
      const positionStore = usePositionStore()
      const derivativeStore = useDerivativeStore()

      if (
        !walletStore.isUserConnected ||
        !walletStore.authZOrInjectiveAddress
      ) {
        return
      }

      const marketsToTokenDecimals = derivativeStore.markets.reduce(
        (marketsMap, market) => {
          return {
            ...marketsMap,
            [market.marketId]: market.quoteToken.decimals
          }
        },
        {} as Record<string, number>
      )
      const { positions } = await indexerDerivativesApi.fetchPositionsV2({
        address: walletStore.authZOrInjectiveAddress
      })

      const markPricesMap = positions.reduce((markPrices, position) => {
        return {
          ...markPrices,
          [position.marketId]: {
            marketId: position.marketId,
            price: new BigNumberInWei(position.markPrice)
              .toBase(
                marketsToTokenDecimals[position.marketId] || usdtToken.decimals
              )
              .toFixed()
          }
        }
      }, {} as MarketMarkPriceMap)

      positionStore.$patch({
        positions
      })

      derivativeStore.$patch({
        marketMarkPriceMap: markPricesMap
      })
    },

    async fetchSubaccountPositions(
      activityFetchOptions?: ActivityFetchOptions
    ) {
      const derivativeStore = useDerivativeStore()
      const positionStore = usePositionStore()
      const accountStore = useAccountStore()
      const walletStore = useSharedWalletStore()

      if (!walletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = activityFetchOptions?.filters

      const { positions, pagination } =
        await indexerDerivativesApi.fetchPositionsV2({
          subaccountId: accountStore.subaccountId,
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          direction: filters?.direction
        })

      positionStore.$patch({
        subaccountPositions: positions,
        subaccountPositionsCount: pagination.total
      })
    },

    // Fetching multiple market orderbooks for unrealized PnL calculation within a market page
    async fetchOpenPositionsMarketsOrderbook() {
      const positionStore = usePositionStore()
      const accountStore = useAccountStore()
      const walletStore = useSharedWalletStore()

      if (!walletStore.isUserConnected || !accountStore.subaccountId) {
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
