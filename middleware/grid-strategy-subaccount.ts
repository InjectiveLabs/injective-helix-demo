import { MainPage, ActivitySubPage, TradingBotsSubPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  const toName = to.name as string
  const gridSpotStrategyRouteName = TradingBotsSubPage.GridSpotMarket

  const activityRouteNames = [
    MainPage.Activity,
    ActivitySubPage.Positions,
    ActivitySubPage.Derivatives
  ]
  const spotAndFuturesRouteNames = ['spot', 'futures']

  if (accountStore.isSgtSubaccount) {
    // We don't allow SGT subaccount to be active on these pages
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

    // When using the SGT subaccount the user can't access derivative activities
    if (
      activityRouteNames.some(
        (route) => route.startsWith(toName) || route === toName
      )
    ) {
      return navigateTo({ name: ActivitySubPage.Spot })
    }
  }
})
