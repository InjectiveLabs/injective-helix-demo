export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const swapRouteName = 'swap'

  if (to.name === swapRouteName && walletStore.isUserWalletConnected) {
    accountStore.$patch({
      subaccountId: walletStore.authZOrDefaultSubaccountId
    })
  }
})
