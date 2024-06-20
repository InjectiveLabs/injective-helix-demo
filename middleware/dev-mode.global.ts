import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useModalStore()
  const walletStore = useSharedWalletStore()

  const hasDevModeQuery = to.query.devMode === 'true'

  if (!appStore.devMode && hasDevModeQuery) {
    appStore.$patch({ devMode: true })

    if (!walletStore.isUserConnected) {
      modalStore.openModal(Modal.DevMode)
    }
  }
})
