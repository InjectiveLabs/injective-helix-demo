import { defineStore } from 'pinia'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import {
  UiSpotTrade,
  UiDerivativeTrade,
  UiSpotOrderHistory,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { indexerAccountApi, indexerDerivativesApi } from '@/app/Services'
import { ActivityFetchOptions } from '@/types'
import {
  streamSpotSubaccountTrades,
  streamSpotSubaccountOrderHistory,
  streamDerivativeSubaccountTrades,
  streamDerivativeSubaccountOrderHistory
} from '@/store/activity/stream'

type ActivityStoreState = {
  subaccountFundingPayments: FundingPayment[]
  tradingRewardsHistory: TradingReward[]
  subaccountFundingPaymentsCount: number
  latestDerivativeOrderHistory?: UiDerivativeOrderHistory
  latestDerivativeTrade?: UiDerivativeTrade
  latestSpotOrderHistory?: UiSpotOrderHistory
  latestSpotTrade?: UiSpotTrade
}

const initialStateFactory = (): ActivityStoreState => ({
  subaccountFundingPayments: [],
  tradingRewardsHistory: [],
  subaccountFundingPaymentsCount: 0,
  latestDerivativeOrderHistory: undefined,
  latestDerivativeTrade: undefined,
  latestSpotOrderHistory: undefined,
  latestSpotTrade: undefined
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
    }
  }
})
