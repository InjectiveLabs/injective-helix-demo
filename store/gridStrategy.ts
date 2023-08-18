import {
  MsgExecuteContractCompat,
  ExecArgRemoveGridStrategy,
  spotPriceToChainPriceToFixed,
  ExecArgCreateSpotGridStrategy,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { msgBroadcastClient, indexerGrpcTradingApi } from '@/app/Services'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { backupPromiseCall } from '@/app/utils/async'

export enum StrategyStatus {
  Active = 'active',
  Removed = 'removed'
}

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
      const gridStrategyStore = useGridStrategyStore()
      const walletStore = useWalletStore()

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

    async createStrategy({
      quoteAmount,
      baseAmount,
      levels,
      lowerBound,
      upperBound
    }: {
      levels: number
      lowerBound: string
      upperBound: string
      quoteAmount: string
      baseAmount?: string
    }) {
      const gridStrategyStore = useGridStrategyStore()
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

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

      const funds = baseAmount
        ? [
            {
              denom: gridStrategyStore.spotMarket.baseToken.denom,
              amount: spotQuantityToChainQuantityToFixed({
                value: baseAmount,
                baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals
              })
            },
            {
              denom: gridStrategyStore.spotMarket.quoteToken.denom,
              amount: spotQuantityToChainQuantityToFixed({
                value: quoteAmount,
                baseDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
              })
            }
          ]
        : {
            denom: gridStrategyStore.spotMarket.quoteToken.denom,
            amount: spotQuantityToChainQuantityToFixed({
              value: quoteAmount,
              baseDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
            })
          }

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
          slippage: '0.2',
          upperBound: spotPriceToChainPriceToFixed({
            value: upperBound,
            baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
            quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
          })
        }),

        funds
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: message,
        injectiveAddress: walletStore.injectiveAddress
      })

      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
    },

    async removeStrategy() {
      const gridStrategyStore = useGridStrategyStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      if (!gridStrategyStore.spotMarket) {
        return
      }

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
        contractAddress: gridMarket.contractAddress,
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
    }
  }
})
