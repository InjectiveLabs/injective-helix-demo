import {
  MsgExecuteContractCompat,
  ExecArgRemoveGridStrategy,
  spotPriceToChainPriceToFixed,
  ExecArgCreateSpotGridStrategy,
  spotQuantityToChainQuantityToFixed,
  TradingStrategy
} from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { msgBroadcastClient, indexerGrpcTradingApi } from '@/app/Services'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { backupPromiseCall } from '@/app/utils/async'
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

      if (!gridStrategyStore.spotMarket) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        accountAddress: walletStore.injectiveAddress
      })

      gridStrategyStore.$patch({ strategies })
    },

    async createStrategy({
      quoteAmount,
      baseAmount,
      levels,
      lowerBound,
      upperBound,
      shouldExitWithQuoteOnly,
      stopLoss,
      takeProfit
    }: {
      levels: number
      lowerBound: string
      upperBound: string
      quoteAmount?: string
      baseAmount?: string
      shouldExitWithQuoteOnly?: boolean
      takeProfit?: string
      stopLoss?: string
    }) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const gridStrategyStore = useGridStrategyStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

      if (!baseAmount && !quoteAmount) {
        return
      }

      await appStore.queue()
      await walletStore.validate()

      if (walletStore.isAuthzWalletConnected) {
        throw new GeneralException(
          new Error('AuthZ not supported for this action')
        )
      }

      const gridMarket = spotGridMarkets.find(
        (market) => market.slug === gridStrategyStore.spotMarket!.slug
      )

      if (!gridMarket) {
        return
      }

      const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
        walletStore.address,
        gridMarket.slug
      )

      const funds = []

      if (baseAmount) {
        funds.push({
          denom: gridStrategyStore.spotMarket.baseToken.denom,
          amount: spotQuantityToChainQuantityToFixed({
            value: baseAmount,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals
          })
        })
      }

      if (quoteAmount) {
        funds.push({
          denom: gridStrategyStore.spotMarket.quoteToken.denom,
          amount: spotQuantityToChainQuantityToFixed({
            value: quoteAmount,
            baseDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          })
        })
      }

      const stopLossValue = stopLoss
        ? spotPriceToChainPriceToFixed({
            value: stopLoss,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          })
        : undefined

      const takeProfitValue = takeProfit
        ? spotPriceToChainPriceToFixed({
            value: takeProfit,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          })
        : undefined

      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: gridMarket.contractAddress,
        sender: walletStore.injectiveAddress,
        execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
          levels,
          subaccountId: gridStrategySubaccountId,
          lowerBound: spotPriceToChainPriceToFixed({
            value: lowerBound,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          }),
          upperBound: spotPriceToChainPriceToFixed({
            value: upperBound,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          }),
          shouldExitWithQuoteOnly,
          stopLoss: stopLossValue,
          takeProfit: takeProfitValue
        }),

        funds
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: message,
        injectiveAddress: walletStore.injectiveAddress
      })

      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
      backupPromiseCall(() => accountStore.fetchAccountPortfolio())
    },

    async removeStrategy(contractAddress?: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const gridStrategyStore = useGridStrategyStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

      await appStore.queue()
      await walletStore.validate()

      if (walletStore.isAuthzWalletConnected) {
        throw new GeneralException(
          new Error('AuthZ not supported for this action')
        )
      }

      const gridMarket = spotGridMarkets.find(
        (m) => m.slug === gridStrategyStore.spotMarket!.slug
      )

      if (!gridMarket) {
        return
      }

      const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
        walletStore.address,
        gridStrategyStore.spotMarket.slug
      )

      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: contractAddress || gridMarket.contractAddress,
        sender: walletStore.injectiveAddress,
        execArgs: ExecArgRemoveGridStrategy.fromJSON({
          subaccountId: gridStrategySubaccountId
        })
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: message,
        injectiveAddress: walletStore.injectiveAddress
      })

      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
      backupPromiseCall(() => accountStore.fetchAccountPortfolio())
    }
  }
})
