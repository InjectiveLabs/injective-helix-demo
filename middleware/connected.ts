export default defineNuxtRouteMiddleware(() => {
  const walletStore = useSharedWalletStore()

  if (!walletStore.isUserConnected) {
    return navigateTo('/')
  }
})
