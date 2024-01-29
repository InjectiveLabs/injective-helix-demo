import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { indexerGrpcTradingApi } from '@/app/Services'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  createStrategy,
  removeStrategy,
  removeStrategyForSubaccount
} from '@/store/gridStrategy/message'
import { StrategyStatus } from '@/types'

type GridStrategyStoreState = {
  spotMarket: UiSpotMarketWithToken | undefined
  strategies: TradingStrategy[]
}

const initialStateFactory = (): GridStrategyStoreState => ({
  spotMarket: undefined,
  strategies: []
})

export const useGridStrategyStore = defineStore('gridStrategy', {
  state: () => initialStateFactory(),
  getters: {
    activeStrategies: (state) =>
      state.strategies.filter(
        (strategy) => strategy.state === StrategyStatus.Active
      ),
    removedStrategies: (state) =>
      state.strategies.filter(
        (strategy) => strategy.state === StrategyStatus.Removed
      )
  },
  actions: {
    createStrategy,
    removeStrategy,
    removeStrategyForSubaccount,

    async fetchStrategies() {
      const walletStore = useWalletStore()
      const gridStrategyStore = useGridStrategyStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

      const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
        walletStore.address,
        gridStrategyStore.spotMarket.slug
      )
      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        subaccountId: gridStrategySubaccountId,
        accountAddress: walletStore.injectiveAddress
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
        accountAddress: walletStore.injectiveAddress
      })

      gridStrategyStore.$patch({ strategies })
    }
  }
})
