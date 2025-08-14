import { streamGridStrategies } from './stream'
import { MarketType } from '@injectivelabs/sdk-ts'
import { indexerGrpcTradingApi } from '@/app/Services'
import { cancelGridStrategiesStream } from '@/app/client/streams/grid-strategies'
import {
  removeStrategy,
  createPerpStrategy,
  createSpotLiquidityBot,
  createSpotGridStrategy,
  removeSubaccountDeposits,
  removeStrategyForSubaccount
} from '@/store/gridStrategy/message'
import { StrategyStatus, StrategyPerformance } from '@/types'
import type { UiSpotMarket } from '@/types'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'

type GridStrategyStoreState = {
  stats: any
  strategies: TradingStrategy[]
  spotMarket: undefined | UiSpotMarket
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
      const sharedSpotStore = useSharedSpotStore()
      const sharedDerivativeStore = useSharedDerivativeStore()

      const marketIds = new Set([
        ...sharedDerivativeStore.marketsWithToken.map(
          ({ marketId }) => marketId
        ),
        ...sharedSpotStore.marketsWithToken.map(({ marketId }) => marketId)
      ])

      return state.strategies.filter((strategy) => {
        const isActive = [
          StrategyStatus.Active,
          StrategyStatus.Pending
        ].includes(strategy.state as StrategyStatus)

        const isMarketInStore = marketIds.has(strategy.marketId)

        return isActive && isMarketInStore
      })
    },

    activeSpotStrategies: (state) => {
      const sharedSpotStore = useSharedSpotStore()

      return state.strategies.filter((strategy) => {
        const isActive = [
          StrategyStatus.Active,
          StrategyStatus.Pending
        ].includes(strategy.state as StrategyStatus)
        const isSpot = strategy.marketType === MarketType.Spot
        const isMarketInSpotStore = sharedSpotStore.marketsWithToken.some(
          ({ marketId }) => strategy.marketId === marketId
        )

        return isActive && isSpot && isMarketInSpotStore
      })
    },

    activeDerivativeStrategies: (state) => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      const derivativeMarketIds = new Set(
        sharedDerivativeStore.markets.map(({ marketId }) => marketId)
      )

      return state.strategies.filter((strategy) => {
        const isActive = [
          StrategyStatus.Active,
          StrategyStatus.Pending
        ].includes(strategy.state as StrategyStatus)

        const isDerivative = strategy.marketType === MarketType.Derivative

        const isMarketInDerivativeStore = derivativeMarketIds.has(
          strategy.marketId
        )

        return isActive && isDerivative && isMarketInDerivativeStore
      })
    },

    removedStrategies: (state) => {
      const sharedSpotStore = useSharedSpotStore()
      const sharedDerivativeStore = useSharedDerivativeStore()

      const marketIds = new Set([
        ...sharedDerivativeStore.markets.map(({ marketId }) => marketId),
        ...sharedSpotStore.markets.map(({ marketId }) => marketId)
      ])

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          marketIds.has(strategy.marketId)
      )
    },

    removedSpotStrategies: (state) => {
      const sharedSpotStore = useSharedSpotStore()
      const spotMarketIds = new Set(
        sharedSpotStore.marketsWithToken.map(({ marketId }) => marketId)
      )

      return state.strategies.filter(
        (strategy) =>
          strategy.state === StrategyStatus.Removed &&
          strategy.marketType === MarketType.Spot &&
          spotMarketIds.has(strategy.marketId)
      )
    },

    removedDerivativeStrategies: (state) => {
      const sharedDerivativeStore = useSharedDerivativeStore()

      const derivativeMarketIds = new Set(
        sharedDerivativeStore.markets.map(({ marketId }) => marketId)
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
    streamGridStrategies,
    createSpotGridStrategy,
    createSpotLiquidityBot,
    removeSubaccountDeposits,
    cancelGridStrategiesStream,
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
