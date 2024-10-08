<script lang="ts" setup>
import { Status, BigNumberInBase } from '@injectivelabs/utils'
import { BankTransferForm, BankTransferField } from '@/types'

const transferFormErrors = useFormErrors()
const sharedWalletStore = useSharedWalletStore()
const transferFormValues = useFormValues() as Ref<BankTransferForm>

withDefaults(
  defineProps<{
    submitStatus?: Status
    fetchAddressStatus?: Status
  }>(),
  {
    submitStatus: () => new Status(),
    fetchAddressStatus: () => new Status()
  }
)

const emit = defineEmits<{
  submit: []
}>()

const isValid = computed(() => {
  if (
    sharedWalletStore.isAuthzWalletConnected ||
    sharedWalletStore.isAutoSignEnabled
  ) {
    return
  }

  if (
    new BigNumberInBase(
      transferFormValues.value[BankTransferField.Amount] || 0
    ).lte(0)
  ) {
    return
  }

  if (!transferFormValues.value[BankTransferField.Address]) {
    return
  }

  if (!transferFormValues.value[BankTransferField.DoubleCheck]) {
    return
  }

  if (transferFormValues.value[BankTransferField.MemoRequired]) {
    return !!transferFormValues.value[BankTransferField.MemoValue]
  }

  return Object.keys(transferFormErrors.value).length === 0
})

function onSubmit() {
  emit('submit')
}
</script>

<template>
  <AppButton
    class="w-full"
    v-bind="{
      isLg: true,
      isPrimary: true,
      disabled: !isValid,
      isLoading: submitStatus.isLoading() || fetchAddressStatus.isLoading()
    }"
    @click="onSubmit"
  >
    {{ $t('portfolio.bankTransfer.title') }}
  </AppButton>
</template>
