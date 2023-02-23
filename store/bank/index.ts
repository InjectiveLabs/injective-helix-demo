import { defineStore } from 'pinia'
import { Coin } from '@injectivelabs/ts-types'
import { BigNumberInWei, INJ_DENOM } from '@injectivelabs/utils'
import {
  PortfolioSubaccountBalanceV2,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts'
import { indexerAccountPortfolioApi } from '@/app/Services'
import { INJ_GAS_BUFFER } from '@/app/utils/constants'
import {
  streamBankBalance,
  streamSubaccountBalance,
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/bank/stream'
import { deposit, transfer, withdraw } from '@/store/bank/message'

type BankStoreState = {
  defaultSubaccountId: string
  bankBalances: Coin[]
  defaultAccountBalances: Coin[]
  subaccountBalanceList: PortfolioSubaccountBalanceV2[]
}

const initialStateFactory = (): BankStoreState => ({
  defaultSubaccountId: '',
  bankBalances: [],
  defaultAccountBalances: [],
  subaccountBalanceList: []
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

    subaccountIds: (state: BankStoreState) => {
      return state.subaccountBalanceList.map(({ subaccountId }) => subaccountId)
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
      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolio(injectiveAddress)

      const defaultAccountBalances =
        accountPortfolio?.subaccountsList.reduce(
          (accountBalances, { subaccountId, denom, deposit }) => {
            if (subaccountId.endsWith('0'.repeat(24))) {
              return [
                ...accountBalances,
                { denom, amount: deposit?.totalBalance || '0' }
              ]
            }
            return accountBalances
          },
          [] as Coin[]
        ) || []

      bankStore.$patch({
        defaultAccountBalances,
        bankBalances: accountPortfolio?.bankBalancesList || [],
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress),
        subaccountBalanceList: accountPortfolio?.subaccountsList || []
      })
    },

    reset() {
      const bankStore = useBankStore()

      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()

      bankStore.$reset()
    }
  }
})
