import { Modal } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()
  const modalStore = useModalStore()
  const walletStore = useWalletStore()

  const toName = to.name as string
  const isDevMode = to.query.devMode === 'true'

  if (isDevMode && !walletStore.isUserWalletConnected) {
    modalStore.openModal(Modal.DevMode)
  }

  if (!isDevMode && toName.startsWith('trading-bots')) {
    return navigateTo('/')
  }

  if (appStore.devMode === undefined) {
    appStore.$patch({ devMode: isDevMode })
  }
})
