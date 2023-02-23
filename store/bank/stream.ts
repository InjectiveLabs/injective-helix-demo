import { Coin } from '@injectivelabs/ts-types'
import {
  streamBankBalances as grpcStreamBankBalances,
  cancelBankBalanceStream as grpcCancelBankBalanceStream,
  streamSubaccountBalances as grpcStreamSubaccountBalance,
  cancelSubaccountBalanceStream as grpcCancelSubaccountBalanceStream
} from '@/app/client/streams/bank'

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

  if (!bankStore.defaultSubaccountId) {
    return
  }

  grpcStreamSubaccountBalance({
    accountAddress: walletStore.injectiveAddress,
    subaccountId: bankStore.defaultSubaccountId,
    callback: ({ amount, denom }) => {
      const accountBalancesExcludingDenom =
        bankStore.defaultAccountBalances.filter(
          (balance: Coin) => balance.denom !== denom
        )

      bankStore.$patch({
        defaultAccountBalances: [
          ...accountBalancesExcludingDenom,
          { denom, amount }
        ]
      })
    }
  })
}
