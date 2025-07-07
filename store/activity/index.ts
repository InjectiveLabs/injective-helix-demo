import { defineStore } from 'pinia'
import { getIndexerAccountApi, getIndexerDerivativesApi } from '@shared/Service'
import { UiSubaccountTransformer } from '@/app/client/transformers/UiSubaccountTransformer'
import type { TradingReward, FundingPayment } from '@injectivelabs/sdk-ts'
import type {
  ActivityFetchOptions,
  UiSubaccountTransactionWithToken
} from '@/types'

type ActivityStoreState = {
  subaccountFundingHistoryCount: number
  tradingRewardsHistory: TradingReward[]
  subaccountFundingHistory: FundingPayment[]
  subaccountTransferTransactionsCount: number
  subaccountTransfers: UiSubaccountTransactionWithToken[]
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
      const indexerAccountApi = await getIndexerAccountApi()

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
      const indexerDerivativesApi = await getIndexerDerivativesApi()

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

    async fetchSubaccountTransfers(options: undefined | ActivityFetchOptions) {
      const indexerAccountApi = await getIndexerAccountApi()

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
