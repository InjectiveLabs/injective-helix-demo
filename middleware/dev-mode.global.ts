import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useSharedModalStore()
  const sharedWalletStore = useSharedWalletStore()

  const hasDevModeQuery = to.query.devMode === 'true'

  if (!appStore.devMode && hasDevModeQuery) {
    appStore.$patch({ devMode: true })

    if (!sharedWalletStore.isUserConnected) {
      modalStore.openModal(Modal.DevMode)
    }
  }
})
