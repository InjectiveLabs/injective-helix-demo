import { defineStore } from 'pinia'
import { TradingReward, FundingPayment } from '@injectivelabs/sdk-ts'
import { indexerAccountApi, indexerDerivativesApi } from '@shared/Service'
import { UiSubaccountTransformer } from '@/app/client/transformers/UiSubaccountTransformer'
import { ActivityFetchOptions, UiSubaccountTransactionWithToken } from '@/types'

type ActivityStoreState = {
  subaccountFundingHistory: FundingPayment[]
  tradingRewardsHistory: TradingReward[]
  subaccountFundingHistoryCount: number
  subaccountTransfers: UiSubaccountTransactionWithToken[]
  subaccountTransferTransactionsCount: number
}

const initialStateFactory = (): ActivityStoreState => ({
  subaccountFundingHistory: [],
  tradingRewardsHistory: [],
  subaccountFundingHistoryCount: 0,
  subaccountTransfers: [],
  subaccountTransferTransactionsCount: 0
})

export const useActivityStore = defineStore('activity', {
  state: (): ActivityStoreState => initialStateFactory(),
  actions: {
    async fetchTradingRewardsHistory() {
      const accountStore = useAccountStore()
      const activityStore = useActivityStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      activityStore.$patch({
        tradingRewardsHistory: await indexerAccountApi.fetchRewards({
          address: sharedWalletStore.authZOrInjectiveAddress,
          epoch: -1
        })
      })
    },

    async fetchSubaccountFundingHistory(options?: ActivityFetchOptions) {
      const accountStore = useAccountStore()
      const activityStore = useActivityStore()
      const derivativeStore = useDerivativeStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { fundingPayments: subaccountFundingHistory, pagination } =
        await indexerDerivativesApi.fetchFundingPayments({
          subaccountId: accountStore.subaccountId,
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          pagination: options?.pagination
        })

      activityStore.$patch({
        subaccountFundingHistory,
        subaccountFundingHistoryCount: pagination.total
      })
    },

    async fetchSubaccountTransfers(options: ActivityFetchOptions | undefined) {
      const activityStore = useActivityStore()
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected || !accountStore.subaccountId) {
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
