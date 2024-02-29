import { OrderbookFormattedRecord } from '@/types/worker'

type OrderbookStoreState = {
  buys: OrderbookFormattedRecord[]
  sells: OrderbookFormattedRecord[]
  isSpot: boolean
}

const initialStateFactory = (): OrderbookStoreState => ({
  buys: [],
  sells: [],
  isSpot: false
})

export const useOrderbookStore = defineStore('orderbook', {
  state: () => initialStateFactory()
})
