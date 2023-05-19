<script setup lang="ts">
import { BridgeField, BridgeType, Modal } from '@/types'

const modalStore = useModalStore()

const formValues = useFormValues()
const formErrors = useFormErrors()

const hasFormErrors = computed(
  () =>
    Object.keys(formErrors.value).length > 0 ||
    formValues.value[BridgeField.Amount] === ''
)

function handleBridgeConfirmation() {
  nextTick(() => {
    modalStore.openModal({ type: Modal.BridgeConfirm })
  })
}
</script>

<template>
  <AppButton
    lg
    :disabled="hasFormErrors"
    class="w-full font-semibold rounded bg-blue-500 text-blue-900"
    data-cy="transfer-modal-transfer-now-button"
    @click="handleBridgeConfirmation"
  >
    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit">
      {{ $t('bridge.depositNow') }}
    </span>

    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Withdraw">
      {{ $t('bridge.withdrawNow') }}
    </span>

    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer">
      {{ $t('bridge.transferNow') }}
    </span>
  </AppButton>
</template>
