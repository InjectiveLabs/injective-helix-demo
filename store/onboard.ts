import { defineStore } from 'pinia'
import {
  UiDerivativeTrade,
  UiSpotTrade,
  UiSubaccountTransfer,
  UiAccountTransformer
} from '@injectivelabs/sdk-ui-ts'
import {
  indexerDerivativesApi,
  indexerSpotApi,
  indexerAccountApi
} from '@/app/Services'

type Trade = UiSpotTrade | UiDerivativeTrade

type OnBoardStoreState = {
  trades: Trade[]
  subaccountTransfers: UiSubaccountTransfer[]
}

const initialStateFactory = (): OnBoardStoreState => ({
  trades: [],
  subaccountTransfers: []
})

export const useOnboardStore = defineStore('onBoard', {
  state: (): OnBoardStoreState => initialStateFactory(),
  getters: {
    hasMadeAnyTransfers: (state: OnBoardStoreState) => {
      return state.subaccountTransfers.length > 0
    },

    hasMadeAnyTrades: (state: OnBoardStoreState) => {
      return state.trades.length > 0
    }
  },
  actions: {
    async init() {
      const onBoardStore = useOnboardStore()

      await onBoardStore.fetchTrades()
      await onBoardStore.fetchTransfers()
    },

    async fetchTrades() {
      const onBoardStore = useOnboardStore()

      const { subaccount } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const { trades: spotTrades } = await indexerSpotApi.fetchTrades({
        subaccountId: subaccount.subaccountId
      })
      const { trades: derivativeTrades } =
        await indexerDerivativesApi.fetchTrades({
          subaccountId: subaccount.subaccountId
        })

      onBoardStore.$patch({
        trades: [...spotTrades, ...derivativeTrades]
      })
    },

    async fetchTransfers() {
      const onBoardStore = useOnboardStore()

      const { subaccount } = useAccountStore()
      const { address, isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !address || !subaccount) {
        return
      }

      const { transfers } = await indexerAccountApi.fetchSubaccountHistory({
        subaccountId: subaccount.subaccountId
      })
      const uiTransfers = transfers.map(
        UiAccountTransformer.grpcAccountTransferToUiAccountTransfer
      )

      onBoardStore.$patch({
        subaccountTransfers: uiTransfers
      })
    },

    reset() {
      const onBoardStore = useOnboardStore()

      onBoardStore.$patch({
        ...initialStateFactory()
      })
    }
  }
})
