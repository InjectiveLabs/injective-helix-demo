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

export const streamBankBalance = ({
  onResetCallback
}: { onResetCallback?: Function } = {}) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  grpcStreamBankBalances({
    onResetCallback,
    accountAddress: sharedWalletStore.authZOrInjectiveAddress,
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

export const streamSubaccountBalance = ({
  onResetCallback
}: { onResetCallback?: Function } = {}) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected || accountStore.subaccountId) {
    return
  }

  grpcStreamSubaccountBalance({
    onResetCallback,
    subaccountId: accountStore.subaccountId,
    accountAddress: sharedWalletStore.authZOrInjectiveAddress,
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
              payload.subaccountId !==
                sharedWalletStore.authZOrDefaultSubaccountId &&
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
