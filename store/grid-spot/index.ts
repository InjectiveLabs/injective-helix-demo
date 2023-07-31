type GridSpotStore = {}

const initialStateFactory = (): GridSpotStore => ({})

export const useGridStore = defineStore('grid-spot', {
  state: () => initialStateFactory()
})
