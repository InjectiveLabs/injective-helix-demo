import { defineStore } from 'pinia'
import { Coin } from '@injectivelabs/ts-types'
import { PositionsWithUPNL } from '@injectivelabs/sdk-ts'
import { indexerAccountPortfolioApi } from '@/app/Services'
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
  externalTransfer
} from '@/store/account/message'
import { SubaccountBalance } from '@/types'

type AccountStoreState = {
  subaccountId: string
  bankBalances: Coin[]
  positionsWithUpnl: PositionsWithUPNL[]
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
}

const initialStateFactory = (): AccountStoreState => ({
  bankBalances: [],
  subaccountId: '',
  positionsWithUpnl: [],
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
    }
  },
  actions: {
    deposit,
    transfer,
    withdraw,
    externalTransfer,
    streamBankBalance,
    streamSubaccountBalance,

    async fetchAccountPortfolio() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolio(
          walletStore.authZOrInjectiveAddress
        )

      const defaultAccountBalances = (
        accountPortfolio.subaccountsList || []
      ).reduce((accountBalances, balance) => {
        if (balance.subaccountId === walletStore.authZOrDefaultSubaccountId) {
          return [
            ...accountBalances,
            {
              denom: balance.denom,
              totalBalance: balance.deposit?.totalBalance || '0',
              availableBalance: balance.deposit?.availableBalance || '0'
            } as SubaccountBalance
          ]
        }

        return accountBalances
      }, [] as SubaccountBalance[])

      const nonDefaultSubaccounts = accountPortfolio.subaccountsList.reduce(
        (accountBalances, subaccountBalance) => {
          if (
            subaccountBalance.subaccountId ===
            walletStore.authZOrDefaultSubaccountId
          ) {
            return accountBalances
          }

          const existingAccountBalances =
            accountBalances[subaccountBalance.subaccountId] || []

          const subaccountAvailableBalance =
            subaccountBalance?.deposit?.availableBalance || '0'
          const subaccountTotalBalance =
            subaccountBalance?.deposit?.totalBalance || '0'

          return {
            ...accountBalances,
            [subaccountBalance.subaccountId]: [
              ...existingAccountBalances,
              {
                denom: subaccountBalance.denom,
                totalBalance: subaccountTotalBalance,
                availableBalance: subaccountAvailableBalance
              }
            ]
          }
        },
        {} as Record<string, SubaccountBalance[]>
      )

      accountStore.$patch({
        subaccountId:
          accountStore.subaccountId || walletStore.authZOrDefaultSubaccountId,
        bankBalances: accountPortfolio.bankBalancesList || [],
        positionsWithUpnl: accountPortfolio.positionsWithUpnlList || [],
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
