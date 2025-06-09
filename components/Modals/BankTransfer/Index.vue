<script lang="ts" setup>
import { injToken } from '@shared/data/token'
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, BusEvents, BankTransferField } from '@/types'

const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  validate,
  values: transferFormValues,
  resetForm: resetTransferForm,
  setValues: setTransferFormValues
} = useForm({
  keepValuesOnUnmount: true
})

const submitStatus = reactive(new Status(StatusType.Idle))

onMounted(() => {
  setTransferFormValues({ [BankTransferField.Denom]: injToken.denom }, false)

  useEventBus(BusEvents.BankTransferModalWithDenom).on((denom) => {
    setTransferFormValues({ [BankTransferField.Denom]: denom }, false)
  })
})

function resetForm() {
  resetTransferForm({
    values: {
      ...transferFormValues,
      [BankTransferField.Search]: '',
      [BankTransferField.Amount]: '',
      [BankTransferField.Address]: '',
      [BankTransferField.MemoValue]: '',
      [BankTransferField.DoubleCheck]: false,
      [BankTransferField.MemoRequired]: false
    }
  })
}

async function onSubmit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  submitStatus.setLoading()

  accountStore
    .transfer({
      amount: transferFormValues[BankTransferField.Amount],
      denom: transferFormValues[BankTransferField.Denom],
      destination: transferFormValues[BankTransferField.Address],
      memo: transferFormValues[BankTransferField.MemoValue]
    })
    .then(() => {
      notificationStore.update({
        title: t('toast.portfolio.bankTransferSuccessful')
      })
      resetForm()
      closeModal()
    })
    .catch($onError)
    .finally(() => {
      submitStatus.setIdle()
    })
}

function closeModal() {
  modalStore.closeModal(Modal.BankTransfer)
  resetForm()
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.BankTransfer]"
    v-bind="{ isMd: true }"
    @on:open="resetForm"
  >
    <template #title>
      <h3>
        {{ $t('portfolio.bankTransfer.title') }}
      </h3>
    </template>

    <ModalsBankTransferForm v-bind="{ submitStatus }" @submit="onSubmit" />
  </AppModal>
</template>
