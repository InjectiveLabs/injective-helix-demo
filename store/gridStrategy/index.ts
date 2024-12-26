import { TradingStrategy, MarketType } from '@injectivelabs/sdk-ts'
import {
  createStrategy,
  removeStrategy,
  createPerpStrategy,
  createSpotLiquidityBot,
  copySpotGridTradingStrategy,
  removeStrategyForSubaccount
} from '@/store/gridStrategy/message'
import { indexerGrpcTradingApi } from '@/app/Services'
import { UiSpotMarket, StrategyStatus, StrategyPerformance } from '@/types'

type GridStrategyStoreState = {
  spotMarket: UiSpotMarket | undefined
  strategies: TradingStrategy[]
  stats: any
}

const initialStateFactory = (): GridStrategyStoreState => ({
  spotMarket: undefined,
  strategies: [],
  stats: undefined
})

export const useGridStrategyStore = defineStore('gridStrategy', {
  state: () => initialStateFactory(),
  getters: {
    activeStrategies: (state) => {
      const spotStore = useSpotStore()
      const derivativeStore = useDerivativeStore()

      return state.strategies.filter((strategy) => {
        const marketInSpotStore = spotStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        const marketInDerivativeStore = derivativeStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        const isActive = strategy.state === StrategyStatus.Active

        return isActive && (marketInSpotStore || marketInDerivativeStore)
      })
    },

    activeSpotStrategies: (state) => {
      const spotStore = useSpotStore()

      return state.strategies.filter((strategy) => {
        const isActive = strategy.state === StrategyStatus.Active
        const isSpot = strategy.marketType === 'spot'
        const isMarketInSpotStore = spotStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isActive && isSpot && isMarketInSpotStore
      })
    },

    activeDerivativeStrategies: (state) => {
      const derivativeStore = useDerivativeStore()

      return state.strategies.filter((strategy) => {
        const isActive = strategy.state === StrategyStatus.Active
        const isDerivative = strategy.marketType === 'derivative'
        const isMarketInDerivativeStore = derivativeStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isActive && isDerivative && isMarketInDerivativeStore
      })
    },

    removedStrategies: (state) => {
      const spotStore = useSpotStore()
      const derivativeStore = useDerivativeStore()

      return state.strategies.filter((strategy) => {
        const isRemoved = strategy.state === StrategyStatus.Removed

        const isMarketInSpotStore = spotStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        const isMarketInDerivativeStore = derivativeStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isRemoved && (isMarketInSpotStore || isMarketInDerivativeStore)
      })
    },

    removedSpotStrategies: (state) => {
      const spotStore = useSpotStore()

      return state.strategies.filter((strategy) => {
        const isRemoved = strategy.state === StrategyStatus.Removed
        const isSpot = strategy.marketType === 'spot'
        const isMarketInSpotStore = spotStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isRemoved && isSpot && isMarketInSpotStore
      })
    },

    removedDerivativeStrategies: (state) => {
      const derivativeStore = useDerivativeStore()

      return state.strategies.filter((strategy) => {
        const isRemoved = strategy.state === StrategyStatus.Removed
        const isDerivative = strategy.marketType === 'derivative'
        const isMarketInDerivativeStore = derivativeStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isRemoved && isDerivative && isMarketInDerivativeStore
      })
    }
  },
  actions: {
    createStrategy,
    removeStrategy,
    createPerpStrategy,
    createSpotLiquidityBot,
    copySpotGridTradingStrategy,
    removeStrategyForSubaccount,

    async fetchStrategies(marketId?: string) {
      const sharedWalletStore = useSharedWalletStore()

      const gridStrategyStore = useGridStrategyStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: sharedWalletStore.authZOrInjectiveAddress,
        marketId
      })

      gridStrategyStore.$patch({ strategies })
    },

    async fetchAllStrategies(params: { active?: boolean } = { active: false }) {
      const { active } = params

      const gridStrategyStore = useGridStrategyStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: sharedWalletStore.authZOrInjectiveAddress,
        limit: 100,
        state: active ? StrategyStatus.Active : undefined,
        marketType: MarketType.Spot
      })

      gridStrategyStore.$patch({ strategies })
    },

    async fetchStrategyWithPnl() {
      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        withPerformance: true,
        withTvl: true,
        limit: 100
      })

      return strategies.filter(
        (strategy) => strategy.performance === StrategyPerformance.Top
      )
    },

    async fetchStrategyStats() {
      const gridStrategyStore = useGridStrategyStore()

      const stats = await indexerGrpcTradingApi.fetchTradingStats()

      gridStrategyStore.$patch((state) => {
        state.stats = stats
      })
    }
  }
})
