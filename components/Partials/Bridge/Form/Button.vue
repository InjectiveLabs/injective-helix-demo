<script lang="ts" setup>
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'

const walletStore = useWalletStore()
const modalStore = useModalStore()

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>
const formErrors = useFormErrors()
const validateForm = useValidateForm()

const { isWithdraw, isTransfer } = useBridgeState(formValues)

const hasFormErrors = computed(() => {
  const isDestinationRequired =
    (isWithdraw.value || isTransfer.value) &&
    !formValues.value[BridgeField.Destination]

  return (
    Object.keys(formErrors.value).length > 0 ||
    formValues.value[BridgeField.Amount] === '' ||
    isDestinationRequired
  )
})

const isDepositAndIsAuthZConnected = computed(
  () =>
    formValues.value[BridgeField.BridgeType] === BridgeType.Deposit &&
    walletStore.isAuthzWalletConnected
)

async function confirm() {
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
    is-lg
    :is-disabled="hasFormErrors || isDepositAndIsAuthZConnected"
    class="w-full font-semibold rounded bg-blue-500 text-blue-900"
    data-cy="transfer-modal-transfer-now-button"
    @click="confirm"
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
