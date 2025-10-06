import { defineStore } from 'pinia'

export type ModalMap = Record<string, boolean>
export type ModalStoreState = { modals: ModalMap }

export const useSharedModalStore = defineStore('sharedModal', {
  state: (): ModalStoreState => ({
    modals: {}
  }),

  actions: {
    openModal(modal: string) {
      const modalStore = useSharedModalStore()

      modalStore.$patch({
        modals: { ...modalStore.modals, [modal]: true }
      })
    },

    closeModal(modal: string) {
      const modalStore = useSharedModalStore()

      modalStore.$patch({
        modals: { ...modalStore.modals, [modal]: false }
      })
    },

    closeAll() {
      const modalStore = useSharedModalStore()

      modalStore.modals = {}
    }
  }
})
