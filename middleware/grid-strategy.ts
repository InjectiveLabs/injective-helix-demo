export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridSpotStrategyRouteName = 'trading-bots-grid-spot-market'
  const activityRouteNames = ['activity-positions', 'activity-derivatives']
  const spotAndFuturesRouteNames = ['spot', 'futures']

  const toName = to.name as string

  if (
    [gridSpotStrategyRouteName, ...spotAndFuturesRouteNames].some((route) =>
      toName.startsWith(route)
    ) &&
    walletStore.isUserWalletConnected
  ) {
    accountStore.$patch({
      subaccountId: walletStore.defaultSubaccountId
    })
  }

  if (
    accountStore.isSgtSubaccount &&
    (activityRouteNames.some((route) => route.startsWith(toName)) ||
      toName === 'activity')
  ) {
    return navigateTo({ name: 'activity-spot' })
  }
})
