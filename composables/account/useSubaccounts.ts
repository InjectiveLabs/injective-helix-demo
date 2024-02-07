import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

export function useSubaccounts(
  options: {
    showLowBalance?: boolean
    includeSgt?: boolean
  } = { includeSgt: true, showLowBalance: false }
) {
  const accountStore = useAccountStore()
  const { t } = useLang()

  const optionsToValue = toValue(options)

  const subaccountSelectOptions = computed(() =>
    accountStore.hasMultipleSubaccounts
      ? Object.keys(accountStore.subaccountBalancesMap)
          .filter((subaccountId) =>
            optionsToValue.includeSgt ? true : !isSgtSubaccountId(subaccountId)
          )
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

  return { subaccount, subaccountSelectOptions }
}
