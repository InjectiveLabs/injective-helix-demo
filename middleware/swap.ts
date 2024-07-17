import { MainPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (to.name === MainPage.Swap && sharedWalletStore.isUserConnected) {
    accountStore.$patch({
      subaccountId: sharedWalletStore.authZOrDefaultSubaccountId
    })
  }
})
