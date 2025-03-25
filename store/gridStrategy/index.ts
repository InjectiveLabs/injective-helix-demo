import { TradingStrategy, MarketType } from '@injectivelabs/sdk-ts'
import {
  removeStrategy,
  createPerpStrategy,
  createSpotLiquidityBot,
  createSpotGridStrategy,
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

      const marketIds = new Set([
        ...spotStore.markets.map(({ marketId }) => marketId),
        ...derivativeStore.markets.map(({ marketId }) => marketId)
      ])

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Active &&
          marketIds.has(strategy.marketId)
      )
    },

    activeSpotStrategies: (state) => {
      const spotStore = useSpotStore()

      return state.strategies.filter((strategy) => {
        const isActive = strategy.state === StrategyStatus.Active
        const isSpot = strategy.marketType === MarketType.Spot
        const isMarketInSpotStore = spotStore.markets.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isActive && isSpot && isMarketInSpotStore
      })
    },

    activeDerivativeStrategies: (state) => {
      const derivativeStore = useDerivativeStore()
      const derivativeMarketIds = new Set(
        derivativeStore.markets.map(({ marketId }) => marketId)
      )

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Active &&
          strategy.marketType === MarketType.Derivative &&
          derivativeMarketIds.has(strategy.marketId)
      )
    },

    removedStrategies: (state) => {
      const spotStore = useSpotStore()
      const derivativeStore = useDerivativeStore()

      const marketIds = new Set([
        ...spotStore.markets.map(({ marketId }) => marketId),
        ...derivativeStore.markets.map(({ marketId }) => marketId)
      ])

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          marketIds.has(strategy.marketId)
      )
    },

    removedSpotStrategies: (state) => {
      const spotStore = useSpotStore()
      const spotMarketIds = new Set(
        spotStore.markets.map(({ marketId }) => marketId)
      )

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          strategy.marketType === MarketType.Spot &&
          spotMarketIds.has(strategy.marketId)
      )
    },

    removedDerivativeStrategies: (state) => {
      const derivativeStore = useDerivativeStore()
      const derivativeMarketIds = new Set(
        derivativeStore.markets.map(({ marketId }) => marketId)
      )

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          strategy.marketType === MarketType.Derivative &&
          derivativeMarketIds.has(strategy.marketId)
      )
    }
  },
  actions: {
    removeStrategy,
    createPerpStrategy,
    createSpotGridStrategy,
    createSpotLiquidityBot,
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
        limit: 200,
        state: active ? StrategyStatus.Active : undefined
      })

      gridStrategyStore.$patch({ strategies })
    },

    async fetchStrategyWithPnl() {
      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        withPerformance: true,
        withTvl: true,
        limit: 300
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
