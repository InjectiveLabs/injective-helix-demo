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
      const walletStore = useWalletStore()

      const gridStrategyStore = useGridStrategyStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: walletStore.injectiveAddress,
        marketId
      })

      gridStrategyStore.$patch({ strategies })
    },

    async fetchAllStrategies() {
      const walletStore = useWalletStore()
      const gridStrategyStore = useGridStrategyStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: walletStore.injectiveAddress,
        limit: 1000
      })

      gridStrategyStore.$patch({ strategies })
    }
  }
})
