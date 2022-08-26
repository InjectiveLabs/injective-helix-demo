import { actionTree, getterTree } from 'typed-vuex'
import { Modal, ModalState } from '~/types'

const modalValues = Object.values(Modal)
const modalExists = (modal: Modal) => modalValues.includes(modal)

const modals = modalValues.reduce((previous: ModalState, current: Modal) => {
  return { ...previous, [current]: false }
}, {} as ModalState)

const initialStateFactory = () => ({
  modals,
  persistModal: undefined,
  data: undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  modals: initialState.modals as ModalState,
  persistModal: initialState.persistModal as Modal | undefined,
  data: initialState.data as any
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

  clearData(state: ModalStoreState) {
    state.data = undefined
  },

  toggleModal(state: ModalStoreState, modal: Modal) {
    if (modalExists(modal)) {
      state.modals = {
        ...state.modals,
        [modal]: !state.modals[modal]
      }
    }
  },

  openModal(state: ModalStoreState, modal: { type: Modal, data?: any }) {
    if (modalExists(modal.type)) {
      const initialState = initialStateFactory()

      state.data = modal.data
      state.modals = { ...initialState.modals, [modal.type]: true }
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

      commit('openModal', { type: persistModal })
      commit('setPersistModal', undefined)
    }
  }
)
