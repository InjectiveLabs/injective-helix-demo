import {
  MsgExecuteContractCompat,
  ExecArgRemoveGridStrategy,
  spotPriceToChainPriceToFixed,
  ExecArgCreateSpotGridStrategy,
  spotQuantityToChainQuantityToFixed,
  TradingStrategy,
  ExitConfig,
  ExitType
} from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { BigNumberInBase } from '@injectivelabs/utils'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { msgBroadcastClient, indexerGrpcTradingApi } from '@/app/Services'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { backupPromiseCall } from '@/app/utils/async'
import { StrategyStatus, SpotGridTradingForm } from '@/types'

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
      grids,
      exitType,
      stopLoss,
      upperPrice,
      lowerPrice,
      takeProfit,
      SettleIn: isSettleInEnabled,
      investmentAmount: quoteAmount,
      baseInvestmentAmount: baseAmount,
      sellBaseOnStopLoss: isSellBaseOnStopLossEnabled,
      buyBaseOnTakeProfit: isBuyBaseOnTakeProfitEnabled
    }: Partial<SpotGridTradingForm>) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const gridStrategyStore = useGridStrategyStore()

      const levels = Number(grids)

      if (!walletStore.injectiveAddress) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

      if (!baseAmount && !quoteAmount) {
        return
      }

      if (!lowerPrice || !upperPrice) {
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

      if (baseAmount && !new BigNumberInBase(baseAmount).eq(0)) {
        funds.push({
          denom: gridStrategyStore.spotMarket.baseToken.denom,
          amount: spotQuantityToChainQuantityToFixed({
            value: baseAmount,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals
          })
        })
      }

      if (quoteAmount && !new BigNumberInBase(quoteAmount).eq(0)) {
        funds.push({
          denom: gridStrategyStore.spotMarket.quoteToken.denom,
          amount: spotQuantityToChainQuantityToFixed({
            value: quoteAmount,
            baseDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          })
        })
      }

      const stopLossValue: ExitConfig | undefined = stopLoss
        ? {
            exitPrice: spotPriceToChainPriceToFixed({
              value: stopLoss,
              baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
              quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
            }),
            exitType: isSellBaseOnStopLossEnabled
              ? ExitType.Quote
              : ExitType.Default
          }
        : undefined

      const takeProfitValue: ExitConfig | undefined = takeProfit
        ? {
            exitPrice: spotPriceToChainPriceToFixed({
              value: takeProfit,
              baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
              quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
            }),
            exitType: isBuyBaseOnTakeProfitEnabled
              ? ExitType.Base
              : ExitType.Default
          }
        : undefined

      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: gridMarket.contractAddress,
        sender: walletStore.injectiveAddress,
        execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
          levels,
          subaccountId: gridStrategySubaccountId,
          lowerBound: spotPriceToChainPriceToFixed({
            value: lowerPrice,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          }),
          upperBound: spotPriceToChainPriceToFixed({
            value: upperPrice,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          }),
          stopLoss: stopLossValue,
          takeProfit: takeProfitValue,
          exitType: isSettleInEnabled
            ? exitType || ExitType.Default
            : ExitType.Default
        }),

        funds
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: message,
        injectiveAddress: walletStore.injectiveAddress
      })

      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
      backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
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
      backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
    }
  }
})
