export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridSpotStrategyRouteName = 'trading-bots-grid-spot-market'

  if (
    [gridSpotStrategyRouteName].includes(to.name as string) &&
    walletStore.isUserWalletConnected
  ) {
    accountStore.$patch({
      subaccountId: walletStore.defaultSubaccountId
    })
  }
})
