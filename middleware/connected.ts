export default defineNuxtRouteMiddleware(() => {
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return navigateTo('/')
  }
})
