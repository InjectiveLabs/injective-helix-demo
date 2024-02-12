export function useSubaccounts() {
  const accountStore = useAccountStore()

  const subaccount = computed({
    get: (): string => accountStore.subaccountId,
    set: (value: string) => {
      accountStore.$patch({
        subaccountId: value
      })
    }
  })

  return { subaccount }
}
