import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'
import { SubAccount, AccountBalance } from '@/types'

export function useSubaccountsTransformer(
  subAccountList: ComputedRef<SubAccount[]>,
  aggregatedPortfolioBalances: ComputedRef<Record<string, AccountBalance[]>>
) {
  const rows = computed(() => {
    return subAccountList.value.map((subaccount) => {
      const balance = aggregatedPortfolioBalances.value[
        subaccount.value
      ].reduce((sum, balance) => {
        const balanceInUsd = new BigNumberInWei(
          balance.accountTotalBalanceInUsd
        ).toBase(balance.token.decimals)

        return sum.plus(balanceInUsd)
      }, ZERO_IN_BASE)

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
