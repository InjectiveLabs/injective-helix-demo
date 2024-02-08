import { ComputedRef } from 'vue'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

export function useSubaccounts(
  options: ComputedRef<{
    includeBotsSubaccounts?: boolean
    showLowBalance?: boolean
  }> = computed(() => ({
    includeBotsSubaccounts: false,
    showLowBalance: false
  }))
) {
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()
  const { aggregatedPortfolioBalances } = useBalance()
  const { t } = useLang()

  const subaccountOptions = computed(() =>
    accountStore.hasMultipleSubaccounts
      ? Object.keys(aggregatedPortfolioBalances.value)
          .filter((subaccountId) => {
            const includeBotsSubaccounts = options.value.includeBotsSubaccounts
              ? true
              : !isSgtSubaccountId(subaccountId)

            const hasBalance = aggregatedPortfolioBalances.value[
              subaccountId
            ].some((balance) =>
              new BigNumberInBase(balance.accountTotalBalance)
                .dp(0, BigNumber.ROUND_DOWN)
                .gt(0)
            )

            const includeLowBalance = options.value.showLowBalance
              ? true
              : hasBalance || subaccountId === walletStore.defaultSubaccountId

            return includeBotsSubaccounts && includeLowBalance
          })
          .map((value) => {
            if (getSubaccountIndex(value) === 0) {
              return { display: `${t('account.main')}`, value }
            }

            if (isSgtSubaccountId(value)) {
              return {
                value,
                display: `SGT ${getMarketSlugFromSubaccountId(value)}`
              }
            }

            return {
              value,
              display: getSubaccountIndex(value).toString()
            }
          })
          .sort((a, b) => a.value.localeCompare(b.value))
      : []
  )

  const subaccount = computed({
    get: (): string => accountStore.subaccountId,
    set: (value: string) => {
      accountStore.$patch({
        subaccountId: value
      })
    }
  })

  return { subaccount, subaccountOptions }
}
