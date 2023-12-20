import { Modal, MainPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useModalStore()
  const walletStore = useWalletStore()

  const toName = to.name as string
  const hasDevModeQuery = to.query.devMode === 'true'

  if (!appStore.devMode && hasDevModeQuery) {
    appStore.$patch({ devMode: true })

    if (!walletStore.isUserWalletConnected) {
      modalStore.openModal(Modal.DevMode)
    }
  }

  if (!appStore.devMode && toName === MainPage.Leaderboard) {
    return navigateTo('/')
  }
})
