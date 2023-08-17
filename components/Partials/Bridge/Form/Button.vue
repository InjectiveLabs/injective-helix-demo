<script setup lang="ts">
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'

const walletStore = useWalletStore()
const modalStore = useModalStore()

const formValues = useFormValues<BridgeForm>()
const formErrors = useFormErrors()
const validateForm = useValidateForm()

const hasFormErrors = computed(
  () =>
    Object.keys(formErrors.value).length > 0 ||
    formValues.value[BridgeField.Amount] === ''
)

const isDepositAndIsAuthZConnected = computed(
  () =>
    formValues.value[BridgeField.BridgeType] === BridgeType.Deposit &&
    walletStore.isAuthzWalletConnected
)

async function handleBridgeConfirmation() {
  const { valid } = await validateForm()

  if (!valid) {
    return
  }

  nextTick(() => {
    modalStore.openModal(Modal.BridgeConfirm)
  })
}
</script>

<template>
  <AppButton
    lg
    :disabled="hasFormErrors || isDepositAndIsAuthZConnected"
    class="w-full font-semibold rounded bg-blue-500 text-blue-900"
    data-cy="transfer-modal-transfer-now-button"
    @click="handleBridgeConfirmation"
  >
    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit">
      <span v-if="walletStore.isAuthzWalletConnected">{{
        $t('bridge.authZNotSupported')
      }}</span>
      <span v-else>{{ $t('bridge.depositNow') }}</span>
    </span>

    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Withdraw">
      {{ $t('bridge.withdrawNow') }}
    </span>

    <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer">
      {{ $t('bridge.transferNow') }}
    </span>
  </AppButton>
</template>
