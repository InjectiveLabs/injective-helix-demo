import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { Modal, ModalState } from '~/types'

const modalValues = Object.values(Modal)
const modalExists = (modal: Modal) => modalValues.includes(modal)

const modals = modalValues.reduce((previous: ModalState, current: Modal) => {
  return { ...previous, [current]: false }
}, {} as ModalState)

const initialState = {
  modals
}

export const state = () => ({
  modals: initialState.modals as ModalState
})

export type ModalStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  closeModal(state: ModalStoreState, modal: Modal) {
    if (modalExists(modal) && state.modals[modal]) {
      state.modals = { ...state.modals, [modal]: false }
    }
  },

  toggleModal(state: ModalStoreState, modal: Modal) {
    if (modalExists(modal)) {
      state.modals = {
        ...state.modals,
        [modal]: !state.modals[modal]
      }
    }
  },

  openModal(state: ModalStoreState, modal: Modal) {
    if (modalExists(modal)) {
      const modals: any = {}

      modalValues.forEach((modal) => {
        if (modal !== modal) {
          modals[modal] = false
        }
      })

      state.modals = { ...modals, [modal]: true }
    }
  }
}
