import { OrderbookFormattedRecord } from '@/types/worker'

type OrderbookStoreState = {
  buys: OrderbookFormattedRecord[]
  sells: OrderbookFormattedRecord[]
  isSpot: boolean
  worstPrice: string
}

const initialStateFactory = (): OrderbookStoreState => ({
  buys: [],
  sells: [],
  isSpot: false,
  worstPrice: ''
})

export const useOrderbookStore = defineStore('orderbook', {
  state: () => initialStateFactory()
})
