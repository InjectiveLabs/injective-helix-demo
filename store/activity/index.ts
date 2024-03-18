import { defineStore } from 'pinia'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import {
  UiSpotTrade,
  UiDerivativeTrade,
  UiSpotOrderHistory,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { indexerAccountApi, indexerDerivativesApi } from '@/app/Services'
import {
  streamSpotSubaccountTrades,
  streamSpotSubaccountOrderHistory,
  streamDerivativeSubaccountTrades,
  streamDerivativeSubaccountOrderHistory
} from '@/store/activity/stream'
import { UiSubaccountTransformer } from '@/app/client/transformers/UiSubaccountTransformer'
import { ActivityFetchOptions, UiSubaccountTransactionWithToken } from '@/types'

type ActivityStoreState = {
  subaccountFundingPayments: FundingPayment[]
  tradingRewardsHistory: TradingReward[]
  subaccountFundingPaymentsCount: number
  latestDerivativeOrderHistory?: UiDerivativeOrderHistory
  latestDerivativeTrade?: UiDerivativeTrade
  latestSpotOrderHistory?: UiSpotOrderHistory
  latestSpotTrade?: UiSpotTrade
  subaccountTransfers: UiSubaccountTransactionWithToken[]
  subaccountTransferTransactionsCount: number
}

const initialStateFactory = (): ActivityStoreState => ({
  subaccountFundingPayments: [],
  tradingRewardsHistory: [],
  subaccountFundingPaymentsCount: 0,
  latestDerivativeOrderHistory: undefined,
  latestDerivativeTrade: undefined,
  latestSpotOrderHistory: undefined,
  latestSpotTrade: undefined,
  subaccountTransfers: [],
  subaccountTransferTransactionsCount: 0
})

export const useActivityStore = defineStore('activity', {
  state: (): ActivityStoreState => initialStateFactory(),
  actions: {
    streamDerivativeSubaccountOrderHistory,
    streamDerivativeSubaccountTrades,
    streamSpotSubaccountOrderHistory,
    streamSpotSubaccountTrades,

    async fetchTradingRewardsHistory() {
      const activityStore = useActivityStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      activityStore.$patch({
        tradingRewardsHistory: await indexerAccountApi.fetchRewards({
          address: walletStore.authZOrInjectiveAddress,
          epoch: -1
        })
      })
    },

    async fetchSubaccountFundingPayments(options?: ActivityFetchOptions) {
      const activityStore = useActivityStore()
      const derivativeStore = useDerivativeStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { fundingPayments: subaccountFundingPayments, pagination } =
        await indexerDerivativesApi.fetchFundingPayments({
          subaccountId: accountStore.subaccountId,
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          pagination: options?.pagination
        })

      activityStore.$patch({
        subaccountFundingPayments,
        subaccountFundingPaymentsCount: pagination.total
      })
    },

    async fetchSubaccountTransfers(options: ActivityFetchOptions | undefined) {
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const activityStore = useActivityStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { transfers, pagination } =
        await indexerAccountApi.fetchSubaccountHistory({
          subaccountId: accountStore.subaccountId,
          denom: filters?.denom,
          pagination: options?.pagination
        })

      const transactions = await Promise.all(
        transfers.map(
          async (transaction) =>
            await UiSubaccountTransformer.convertSubaccountTransfersToUiSubaccountTransaction(
              transaction
            )
        )
      )

      activityStore.$patch({
        subaccountTransfers: transactions,
        subaccountTransferTransactionsCount: pagination.total
      })
    }
  }
})
