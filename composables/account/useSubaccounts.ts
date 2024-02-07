import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

export function useSubaccounts() {
  const route = useRoute()
  const accountStore = useAccountStore()
  const { t } = useLang()

  const isSpotOrFuturesRoute = computed(() =>
    ['spot', 'futures'].some((r) => (route.name as string).startsWith(r))
  )

  const subaccountSelectOptions = computed(() =>
    accountStore.hasMultipleSubaccounts
      ? Object.keys(accountStore.subaccountBalancesMap)
          .filter((subaccountId) =>
            isSpotOrFuturesRoute.value ? !isSgtSubaccountId(subaccountId) : true
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
