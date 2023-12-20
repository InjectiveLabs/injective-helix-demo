import { PortfolioSubaccountBalanceV2 } from '@injectivelabs/sdk-ts'
import { SubaccountBalance } from '@/types'

export const getDefaultAccountBalances = (
  subaccountsList: PortfolioSubaccountBalanceV2[],
  authZOrDefaultSubaccountId: string
): SubaccountBalance[] => {
  return subaccountsList
    .filter((balance) => balance.subaccountId === authZOrDefaultSubaccountId)
    .map((balance) => ({
      denom: balance.denom,
      totalBalance: balance.deposit?.totalBalance || '0',
      availableBalance: balance.deposit?.availableBalance || '0'
    }))
}

export const getNonDefaultSubaccountBalances = (
  subaccountsList: PortfolioSubaccountBalanceV2[],
  authZOrDefaultSubaccountId: string
): Record<string, SubaccountBalance[]> => {
  return subaccountsList.reduce(
    (accountBalances, subaccountBalance) => {
      if (subaccountBalance.subaccountId === authZOrDefaultSubaccountId) {
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
}
