import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'
import { SubAccount, AccountBalance } from '@/types'

export function useSubaccountsTransformer(
  subAccountList: ComputedRef<SubAccount[]>,
  balances: ComputedRef<Record<string, AccountBalance[]>>
) {
  const rows = computed(() =>
    subAccountList.value.map((subaccount) => {
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
        formattedAddress: sharedEllipsisFormatText(
          subaccount.value,
          DEFAULT_TRUNCATE_LENGTH
        )
      }
    })
  )

  return { rows }
}
