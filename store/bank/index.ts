import { defineStore } from 'pinia'
import { Coin } from '@injectivelabs/ts-types'
import { BigNumberInWei, INJ_DENOM } from '@injectivelabs/utils'
import { indexerAccountPortfolioApi } from '@/app/Services'
import { INJ_GAS_BUFFER } from '@/app/utils/constants'
import {
  streamBankBalance,
  streamSubaccountBalance,
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/bank/stream'
import { deposit, transfer, withdraw } from '@/store/bank/message'
import { SubaccountBalance } from '~~/types'

type BankStoreState = {
  // currently selected subaccountId, set at the default one until we have multi-subaccount support
  subaccountId: string
  bankBalances: Coin[]
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
}

const initialStateFactory = (): BankStoreState => ({
  bankBalances: [],
  subaccountId: '',
  subaccountBalancesMap: {}
})

export const useBankStore = defineStore('bank', {
  state: (): BankStoreState => initialStateFactory(),
  getters: {
    balanceMap: (state: BankStoreState) => {
      if (state.bankBalances.length === 0) {
        return {}
      }

      return state.bankBalances.reduce((list, balance) => {
        return { ...list, [balance.denom]: balance.amount }
      }, {} as Record<string, string>)
    },

    defaultSubaccountBalances: (state: BankStoreState) => {
      const walletStore = useWalletStore()

      if (!walletStore.defaultSubaccountId) {
        return []
      }

      return state.subaccountBalancesMap[walletStore.defaultSubaccountId]
    },

    hasEnoughInjForGas: (state) => {
      const walletStore = useWalletStore()

      const injBalance =
        state.bankBalances.find(({ denom }) => denom === INJ_DENOM)?.amount ||
        '0'

      const hasEnoughInjForGas = new BigNumberInWei(injBalance)
        .toBase()
        .gte(INJ_GAS_BUFFER)

      return walletStore.isWalletExemptFromGasFee || hasEnoughInjForGas
    }
  },
  actions: {
    deposit,
    transfer,
    withdraw,
    streamBankBalance,
    streamSubaccountBalance,

    async fetchAccountPortfolio() {
      const bankStore = useBankStore()
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolio(
          walletStore.injectiveAddress
        )

      const defaultAccountBalances = accountPortfolio?.subaccountsList.reduce(
        (accountBalances, balance) => {
          if (balance.subaccountId === walletStore.defaultSubaccountId) {
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
        },
        [] as SubaccountBalance[]
      )

      const nonDefaultSubaccounts = accountPortfolio?.subaccountsList.reduce(
        (accountBalances, subaccountBalance) => {
          if (
            subaccountBalance.subaccountId === walletStore.defaultSubaccountId
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

      bankStore.$patch({
        subaccountId: walletStore.defaultSubaccountId,
        bankBalances: accountPortfolio?.bankBalancesList || [],
        subaccountBalancesMap: {
          [walletStore.defaultSubaccountId]: defaultAccountBalances,
          ...nonDefaultSubaccounts
        }
      })
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useBankStore().$reset()
    }
  }
})
