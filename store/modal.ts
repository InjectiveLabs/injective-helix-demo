import { actionTree, getterTree } from 'typed-vuex'
import { Modal, ModalState } from '~/types'

const modalValues = Object.values(Modal)
const modalExists = (modal: Modal) => modalValues.includes(modal)

const modals = modalValues.reduce((previous: ModalState, current: Modal) => {
  return { ...previous, [current]: false }
}, {} as ModalState)

const initialStateFactory = () => ({
  modals,
  persistModal: undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  modals: initialState.modals as ModalState,
  persistModal: initialState.persistModal as Modal | undefined
})

export type ModalStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setPersistModal(state: ModalStoreState, modal: Modal | undefined) {
    state.persistModal = modal
  },

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
      const initialState = initialStateFactory()

      state.modals = { ...initialState.modals, [modal]: true }
    }
  },

  reset(state: ModalStoreState) {
    const initialState = initialStateFactory()

    state.modals = initialState.modals
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    openPersistedModalIfExist({ commit, state }) {
      const { persistModal } = state

      if (!persistModal) {
        return
      }

      commit('openModal', persistModal)
      commit('setPersistModal', undefined)
    }
  }
)
