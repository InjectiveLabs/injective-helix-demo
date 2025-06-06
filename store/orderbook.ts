import { OrderbookFormattedRecord } from '@/types/worker'
import {
  streamSpotOrderbookUpdate,
  cancelSpotOrderbookUpdate,
  streamDerivativeOrderbookUpdate,
  cancelDerivativeOrderbookUpdate
} from '@/app/client/streams/orderbook'

type OrderbookStoreState = {
  isSpot: boolean
  worstPrice: string
  highestBuyPrice: string
  lowestSellPrice: string
  buys: OrderbookFormattedRecord[]
  sells: OrderbookFormattedRecord[]
}

const initialStateFactory = (): OrderbookStoreState => ({
  buys: [],
  sells: [],
  isSpot: false,
  worstPrice: '',
  highestBuyPrice: '',
  lowestSellPrice: ''
})

export const useOrderbookStore = defineStore('orderbook', {
  state: () => initialStateFactory(),
  actions: {
    streamSpotOrderbookUpdate,
    cancelSpotOrderbookUpdate,
    streamDerivativeOrderbookUpdate,
    cancelDerivativeOrderbookUpdate
  }
})
