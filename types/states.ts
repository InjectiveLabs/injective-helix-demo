import { Modal } from './enums'

export type ModalState = Record<Modal, boolean>

export interface ModalStoreState {
  modals: ModalState
}
