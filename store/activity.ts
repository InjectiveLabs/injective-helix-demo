import { defineStore } from 'pinia'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import { BankBalanceWithTokenAndBalance } from '@injectivelabs/sdk-ui-ts'
import { indexerAccountApi, indexerDerivativesApi } from '@/app/Services'
import { ActivityFetchOptions } from '@/types'

type ActivityStoreState = {
  subaccountFundingPayments: FundingPayment[]
  tradingRewardsHistory: TradingReward[]
  subaccountFundingPaymentsCount: number
  supportedTokens: BankBalanceWithTokenAndBalance[]
}

const initialStateFactory = (): ActivityStoreState => ({
  subaccountFundingPayments: [],
  tradingRewardsHistory: [],
  subaccountFundingPaymentsCount: 0,
  supportedTokens: []
})

export const useActivityStore = defineStore('activity', {
  state: (): ActivityStoreState => initialStateFactory(),
  actions: {
    async fetchTradingRewardsHistory() {
      const activityStore = useActivityStore()
      const { subaccount } = useAccountStore()
      const { isUserWalletConnected, injectiveAddress } = useWalletStore()

      if (!isUserWalletConnected || !subaccount || !injectiveAddress) {
        return
      }

      activityStore.$patch({
        tradingRewardsHistory: await indexerAccountApi.fetchRewards({
          address: injectiveAddress,
          epoch: -1
        })
      })
    },

    async fetchSubaccountFundingPayments(
      activityFetchOptions: ActivityFetchOptions | undefined
    ) {
      const activityStore = useActivityStore()
      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const paginationOptions = activityFetchOptions?.pagination
      const filters = activityFetchOptions?.filters
      const endTime = paginationOptions?.endTime || 0

      const { fundingPayments: subaccountFundingPayments, pagination } =
        await indexerDerivativesApi.fetchFundingPayments({
          marketId: filters?.marketId,
          marketIds: filters?.marketIds,
          subaccountId: subaccount.subaccountId,
          pagination: {
            skip: paginationOptions ? paginationOptions.skip : 0,
            limit: paginationOptions ? paginationOptions.limit : 0,
            endTime
          }
        })

      activityStore.$patch({
        subaccountFundingPayments,
        subaccountFundingPaymentsCount: pagination.total
      })
    }
  }
})
