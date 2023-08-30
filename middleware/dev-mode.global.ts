import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useModalStore()
  const walletStore = useWalletStore()

  const isDevMode = to.query.devMode === 'true'

  if (isDevMode) {
    appStore.$patch({ devMode: true })
    if (!walletStore.isUserWalletConnected) {
      modalStore.openModal(Modal.DevMode)
    }
  }

  if (!isDevMode && (to.name as string).startsWith('trading-bots')) {
    return navigateTo('/')
  }
})
