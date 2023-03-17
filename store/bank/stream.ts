import { Coin } from '@injectivelabs/ts-types'
import {
  streamBankBalances as grpcStreamBankBalances,
  cancelBankBalanceStream as grpcCancelBankBalanceStream,
  streamSubaccountBalances as grpcStreamSubaccountBalance,
  cancelSubaccountBalanceStream as grpcCancelSubaccountBalanceStream
} from '@/app/client/streams/bank'
import { SubaccountBalance } from '@/types'

export const cancelBankBalanceStream = grpcCancelBankBalanceStream
export const cancelSubaccountBalanceStream = grpcCancelSubaccountBalanceStream

export const streamBankBalance = () => {
  const bankStore = useBankStore()
  const walletStore = useWalletStore()

  if (!walletStore.injectiveAddress) {
    return
  }

  grpcStreamBankBalances({
    accountAddress: walletStore.injectiveAddress,
    callback: ({ amount, denom }) => {
      const bankBalancesExcludingDenom = bankStore.bankBalances.filter(
        (balance: Coin) => balance.denom !== denom
      )

      bankStore.$patch({
        bankBalances: [...bankBalancesExcludingDenom, { denom, amount }]
      })
    }
  })
}

export const streamSubaccountBalance = () => {
  const bankStore = useBankStore()
  const walletStore = useWalletStore()

  if (!bankStore.subaccountId) {
    return
  }

  grpcStreamSubaccountBalance({
    accountAddress: walletStore.injectiveAddress,
    subaccountId: bankStore.subaccountId,
    callback: ({ amount, denom }) => {
      const accountBalancesExcludingDenom = bankStore.subaccountBalancesMap[
        bankStore.subaccountId
      ].filter((balance: SubaccountBalance) => balance.denom !== denom)

      const subaccountBalancesMap = {
        [bankStore.subaccountId]: [
          ...accountBalancesExcludingDenom,
          { denom, totalBalance: amount, availableBalance: '0' }
        ]
      }

      bankStore.$patch({
        subaccountBalancesMap
      })
    }
  })
}
