import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const { $pinia } = useNuxtApp()
  const appStore = useAppStore($pinia)
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
