import { TradingStrategy } from '@injectivelabs/sdk-ts'
import {
  createStrategy,
  removeStrategy,
  removeStrategyForSubaccount
} from '@/store/gridStrategy/message'
import { indexerGrpcTradingApi } from '@/app/Services'
import { UiSpotMarket, StrategyStatus } from '@/types'

type GridStrategyStoreState = {
  spotMarket: UiSpotMarket | undefined
  strategies: TradingStrategy[]
}

const initialStateFactory = (): GridStrategyStoreState => ({
  spotMarket: undefined,
  strategies: []
})

export const useGridStrategyStore = defineStore('gridStrategy', {
  state: () => initialStateFactory(),
  getters: {
    activeStrategies: (state) => {
      const spotStore = useSpotStore()

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Active &&
          strategy.marketType === 'spot' &&
          spotStore.markets.some(
            ({ marketId }) => strategy.marketId === marketId
          )
      )
    },

    removedStrategies: (state) => {
      const spotStore = useSpotStore()

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          strategy.marketType === 'spot' &&
          spotStore.markets.some(
            ({ marketId }) => strategy.marketId === marketId
          )
      )
    }
  },
  actions: {
    createStrategy,
    removeStrategy,
    removeStrategyForSubaccount,

    async fetchStrategies(marketId?: string) {
      const sharedWalletStore = useSharedWalletStore()

      const gridStrategyStore = useGridStrategyStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: sharedWalletStore.injectiveAddress,
        marketId
      })

      gridStrategyStore.$patch({ strategies })
    },

    async fetchAllStrategies() {
      const gridStrategyStore = useGridStrategyStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: sharedWalletStore.injectiveAddress,
        limit: 1000
      })

      gridStrategyStore.$patch({ strategies })
    }
  }
})
