import { defineStore } from 'pinia'
import {
  indexerRestExplorerApi,
  indexerAccountPortfolioApi
} from '@shared/Service'
import { Coin } from '@injectivelabs/ts-types'
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
  cw20Balances: { address: string; amount: string }[]
  bankBalances: Coin[]
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
}

const initialStateFactory = (): AccountStoreState => ({
  bankBalances: [],
  cw20Balances: [],
  subaccountId: '',
  subaccountBalancesMap: {}
})

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => initialStateFactory(),
  getters: {
    balancesMap: (state: AccountStoreState) => {
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

    cw20BalancesMap: (state: AccountStoreState) => {
      if (state.cw20Balances.length === 0) {
        return {}
      }

      return state.cw20Balances.reduce(
        (list, balance) => {
          return { ...list, [balance.address]: balance.amount }
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

      await accountStore.fetchCw20Balances()

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

    async fetchCw20Balances() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const cw20Balances =
        await indexerRestExplorerApi.fetchCW20BalancesNoThrow(
          walletStore.injectiveAddress
        )

      accountStore.$patch({
        cw20Balances: cw20Balances.map((balance) => ({
          address: balance.contract_address,
          amount: balance.balance
        }))
      })
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useAccountStore().$reset()
    }
  }
})
