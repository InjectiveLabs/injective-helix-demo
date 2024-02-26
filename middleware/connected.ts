import { ROUTES } from '@/app/utils/constants'
import { MainPage } from '~/types'

export default defineNuxtRouteMiddleware((to) => {
  const walletStore = useWalletStore()

  if (
    ROUTES.walletConnectedRequiredRouteNames.includes(to.name as MainPage) &&
    !walletStore.isUserWalletConnected
  ) {
    return navigateTo('/')
  }
})
