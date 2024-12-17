import { ZERO_IN_BASE } from '@shared/utils/constant'
import { formatWalletAddress } from '@injectivelabs/utils'
import { SubAccount, AccountBalance } from '@/types'

export function useSubaccountsTransformer(
  subAccountList: ComputedRef<SubAccount[]>,
  balances: ComputedRef<Record<string, AccountBalance[]>>
) {
  const rows = computed(() => {
    return subAccountList.value.map((subaccount) => {
      const balance = balances.value[subaccount.value].reduce(
        (sum, balance) => {
          return sum.plus(balance.totalBalanceInUsd)
        },
        ZERO_IN_BASE
      )

      return {
        balance,
        value: subaccount.value,
        display: subaccount.display,
        formattedAddress: formatWalletAddress(subaccount.value)
      }
    })
  })

  return { rows }
}
