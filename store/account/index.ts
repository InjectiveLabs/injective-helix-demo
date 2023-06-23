import { defineStore } from 'pinia'
import { Coin } from '@injectivelabs/ts-types'
import { BigNumberInWei, INJ_DENOM } from '@injectivelabs/utils'
import { PositionsWithUPNL } from '@injectivelabs/sdk-ts'
import { indexerAccountPortfolioApi } from '@/app/Services'
import { INJ_GAS_BUFFER } from '@/app/utils/constants'
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
  // currently selected subaccountId, set at the default one until we have multi-subaccount support
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

      return state.bankBalances.reduce((list, balance) => {
        return { ...list, [balance.denom]: balance.amount }
      }, {} as Record<string, string>)
    },

    defaultSubaccountBalances: (state: AccountStoreState) => {
      const walletStore = useWalletStore()

      if (!walletStore.defaultSubaccountId) {
        return []
      }

      return state.subaccountBalancesMap[walletStore.defaultSubaccountId]
    },

    isDefaultSubaccount: (state: AccountStoreState) => {
      const walletStore = useWalletStore()

      return walletStore.defaultSubaccountId === state.subaccountId
    },

    hasMultipleSubaccounts: (state: AccountStoreState) => {
      return Object.keys(state.subaccountBalancesMap).length > 1
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
    externalTransfer,
    streamBankBalance,
    streamSubaccountBalance,

    async fetchAccountPortfolio() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolio(
          walletStore.injectiveAddress
        )

      const defaultAccountBalances = (
        accountPortfolio.subaccountsList || []
      ).reduce((accountBalances, balance) => {
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
      }, [] as SubaccountBalance[])

      const nonDefaultSubaccounts = accountPortfolio.subaccountsList.reduce(
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

      accountStore.$patch({
        subaccountId:
          accountStore.subaccountId || walletStore.defaultSubaccountId,
        bankBalances: accountPortfolio.bankBalancesList || [],
        positionsWithUpnl: accountPortfolio.positionsWithUpnlList || [],
        subaccountBalancesMap: {
          [walletStore.defaultSubaccountId]: defaultAccountBalances,
          ...nonDefaultSubaccounts
        }
      })
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useAccountStore().$reset()
    },

    /**
     * Reset to the default subaccount
     * as we don't allow using others page
     * except the activity/account page for now
     */
    resetToDefaultSubaccount() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      accountStore.$patch({
        subaccountId: walletStore.defaultSubaccountId
      })
    }
  }
})
