import { defineStore } from 'pinia'
import { Coin } from '@injectivelabs/ts-types'
import { indexerAccountPortfolioApi } from '@shared/Service'
import {
  streamBankBalance,
  streamSubaccountBalance,
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/account/stream'
import {
  deposit,
  transfer,
  withdraw,
  withdrawToMain,
  externalTransfer
} from '@/store/account/message'
import { SubaccountBalance } from '@/types'
import { isSgtSubaccountId } from '@/app/utils/helpers'
import {
  getDefaultAccountBalances,
  getNonDefaultSubaccountBalances
} from '@/app/client/utils/account'

type AccountStoreState = {
  subaccountId: string
  bankBalances: Coin[]
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
}

const initialStateFactory = (): AccountStoreState => ({
  bankBalances: [],
  subaccountId: '',
  subaccountBalancesMap: {}
})

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => initialStateFactory(),
  getters: {
    balanceMap: (state: AccountStoreState) => {
      if (state.bankBalances.length === 0) {
        return {}
      }

      return state.bankBalances.reduce(
        (list, balance) => {
          return { ...list, [balance.denom]: balance.amount }
        },
        {} as Record<string, string>
      )
    },

    defaultSubaccountBalances: (state: AccountStoreState) => {
      const walletStore = useWalletStore()

      if (!walletStore.authZOrDefaultSubaccountId) {
        return []
      }

      return state.subaccountBalancesMap[walletStore.authZOrDefaultSubaccountId]
    },

    isDefaultSubaccount: (state: AccountStoreState) => {
      const walletStore = useWalletStore()

      return walletStore.authZOrDefaultSubaccountId === state.subaccountId
    },

    hasMultipleSubaccounts: (state: AccountStoreState) => {
      return Object.keys(state.subaccountBalancesMap).length > 1
    },

    isSgtSubaccount: (state) => isSgtSubaccountId(state.subaccountId)
  },
  actions: {
    deposit,
    transfer,
    withdraw,
    withdrawToMain,
    externalTransfer,
    streamBankBalance,
    streamSubaccountBalance,
    cancelBankBalanceStream,
    cancelSubaccountBalanceStream,

    async fetchAccountPortfolioBalances() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolioBalances(
          walletStore.authZOrInjectiveAddress
        )

      const defaultAccountBalances = getDefaultAccountBalances(
        accountPortfolio.subaccountsList,
        walletStore.authZOrDefaultSubaccountId
      )

      const nonDefaultSubaccounts = getNonDefaultSubaccountBalances(
        accountPortfolio.subaccountsList,
        walletStore.authZOrDefaultSubaccountId
      )

      const subaccountId =
        accountStore.subaccountId || walletStore.authZOrDefaultSubaccountId

      accountStore.$patch({
        subaccountId: subaccountId.includes(walletStore.authZOrAddress)
          ? subaccountId
          : walletStore.authZOrDefaultSubaccountId,
        bankBalances: accountPortfolio.bankBalancesList || [],
        subaccountBalancesMap: {
          [walletStore.authZOrDefaultSubaccountId]: defaultAccountBalances,
          ...nonDefaultSubaccounts
        }
      })
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useAccountStore().$reset()
    }
  }
})
