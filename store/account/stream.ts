import { Coin } from '@injectivelabs/ts-types'
import {
  streamBankBalances as grpcStreamBankBalances,
  cancelBankBalanceStream as grpcCancelBankBalanceStream,
  streamSubaccountBalances as grpcStreamSubaccountBalance,
  cancelSubaccountBalanceStream as grpcCancelSubaccountBalanceStream
} from '@/app/client/streams/bank'
import { SubaccountBalance, SubaccountBalanceStreamType } from '@/types'

export const cancelBankBalanceStream = grpcCancelBankBalanceStream
export const cancelSubaccountBalanceStream = grpcCancelSubaccountBalanceStream

export const streamBankBalance = () => {
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (!walletStore.isUserConnected) {
    return
  }

  grpcStreamBankBalances({
    accountAddress: walletStore.authZOrInjectiveAddress,
    callback: ({ amount, denom }) => {
      const bankBalancesExcludingDenom = accountStore.bankBalances.filter(
        (balance: Coin) => balance.denom !== denom
      )

      accountStore.$patch({
        bankBalances: [...bankBalancesExcludingDenom, { denom, amount }]
      })
    }
  })
}

export const streamSubaccountBalance = (subaccountId?: string) => {
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()

  if (
    !walletStore.isUserConnected ||
    !(accountStore.subaccountId || subaccountId)
  ) {
    return
  }

  grpcStreamSubaccountBalance({
    accountAddress: walletStore.authZOrInjectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    callback: (payload) => {
      const subaccountBalancesMapOrBlank =
        accountStore.subaccountBalancesMap[accountStore.subaccountId] || []
      const accountBalancesExcludingDenom = subaccountBalancesMapOrBlank.filter(
        (balance: SubaccountBalance) => balance.denom !== payload.denom
      )
      const accountBalance = subaccountBalancesMapOrBlank.find(
        (balance: SubaccountBalance) => balance.denom === payload.denom
      )

      const subaccountBalancesMap = {
        [accountStore.subaccountId]: [
          ...accountBalancesExcludingDenom,
          {
            denom: payload.denom,
            totalBalance:
              payload.type === SubaccountBalanceStreamType.TotalBalance
                ? payload.amount
                : accountBalance?.totalBalance || '0',
            availableBalance:
              payload.subaccountId !== walletStore.authZOrDefaultSubaccountId &&
              payload.type === SubaccountBalanceStreamType.AvailableBalance
                ? payload.amount
                : accountBalance?.availableBalance || '0'
          }
        ]
      }

      accountStore.$patch({
        subaccountBalancesMap
      })
    }
  })
}
