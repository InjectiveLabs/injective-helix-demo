import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useModalStore()
  const walletStore = useWalletStore()

  const toName = to.name as string
  const isDevMode = to.query.devMode === 'true'

  if (isDevMode) {
    if (!walletStore.isUserWalletConnected) {
      modalStore.openModal(Modal.DevMode)
    }

    appStore.$patch({ devMode: true })
  }

  if (!isDevMode && toName.startsWith('trading-bots')) {
    return navigateTo('/')
  }
})
