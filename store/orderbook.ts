type OrderbookStoreState = {
  buys: any[]
  sells: any[]
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
