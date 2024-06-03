export default defineNuxtRouteMiddleware(() => {
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected) {
    return navigateTo('/')
  }
})
