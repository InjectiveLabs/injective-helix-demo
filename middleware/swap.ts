export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()
  const swapRouteName = 'swap'

  if (to.name === swapRouteName && walletStore.isUserConnected) {
    accountStore.$patch({
      subaccountId: walletStore.authZOrDefaultSubaccountId
    })
  }
})
