import { defineStore } from 'pinia'
import { FundingPayment, TradingReward } from '@injectivelabs/sdk-ts'
import {
  BankBalanceWithTokenAndBalance,
  UiDerivativeOrderHistory,
  UiDerivativeTrade,
  UiSpotOrderHistory,
  UiSpotTrade
} from '@injectivelabs/sdk-ui-ts'
import { indexerAccountApi, indexerDerivativesApi } from '@/app/Services'
import { ActivityFetchOptions } from '@/types'
import {
  streamDerivativeSubaccountOrderHistory,
  streamDerivativeSubaccountTrades,
  streamSpotSubaccountOrderHistory,
  streamSpotSubaccountTrades
} from '@/store/activity/stream'

type ActivityStoreState = {
  subaccountFundingPayments: FundingPayment[]
  tradingRewardsHistory: TradingReward[]
  supportedTokens: BankBalanceWithTokenAndBalance[]
  subaccountFundingPaymentsCount: number
  latestDerivativeOrderHistory?: UiDerivativeOrderHistory
  latestDerivativeTrade?: UiDerivativeTrade
  latestSpotOrderHistory?: UiSpotOrderHistory
  latestSpotTrade?: UiSpotTrade
}

const initialStateFactory = (): ActivityStoreState => ({
  subaccountFundingPayments: [],
  tradingRewardsHistory: [],
  supportedTokens: [],
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

    async fetchSubaccountFundingPayments(options?: ActivityFetchOptions) {
      const activityStore = useActivityStore()
      const derivativeStore = useDerivativeStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const filters = options?.filters

      const { fundingPayments: subaccountFundingPayments, pagination } =
        await indexerDerivativesApi.fetchFundingPayments({
          marketIds: filters?.marketIds || derivativeStore.activeMarketIds,
          subaccountId: subaccount.subaccountId,
          pagination: options?.pagination
        })

      activityStore.$patch({
        subaccountFundingPayments,
        subaccountFundingPaymentsCount: pagination.total
      })
    }
  }
})
