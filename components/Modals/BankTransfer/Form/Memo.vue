<script lang="ts" setup>
import { BINANCE_DEPOSIT_ADDRESS } from '@shared/utils/constant'
import { BankTransferField, BankTransferForm } from '@/types'

const bankTransferFormValues = useFormValues() as Ref<BankTransferForm>

const { value: memoRequired, resetField: resetMemoRequired } = useBooleanField({
  name: BankTransferField.MemoRequired,
  rule: ''
})

const {
  value: memo,
  errors: memoErrors,
  resetField: resetMemoField
} = useStringField({
  name: BankTransferField.MemoValue,
  rule: '',
  dynamicRule: computed(() => (memoRequired.value ? 'required' : ''))
})

function onUpdateMemoRequired() {
  if (memoRequired.value) {
    return
  }

  resetMemoField()
}

watch(
  () => bankTransferFormValues.value[BankTransferField.Address],
  (recipientAddress: string) => {
    if (BINANCE_DEPOSIT_ADDRESS === recipientAddress) {
      memoRequired.value = true
    } else {
      resetMemoField()
      resetMemoRequired()
    }
  }
)
</script>

<template>
  <div class="my-4 text-xs">
    <div class="flex justify-between items-center">
      <div>
        {{ $t('portfolio.bankTransfer.memo.title') }}
      </div>

      <AppCheckbox2
        v-model="memoRequired"
        :disabled="
          bankTransferFormValues[BankTransferField.Address] ===
          BINANCE_DEPOSIT_ADDRESS
        "
        @update:modelValue="onUpdateMemoRequired"
      >
        <div class="text-xs leading-4 tracking-wide text-coolGray-200">
          {{ $t('portfolio.bankTransfer.memo.required') }}
        </div>
      </AppCheckbox2>
    </div>

    <div
      v-if="memoRequired"
      class="p-2 py-3 max-h-xs space-y-3 bg-coolGray-950 rounded-md"
    >
      <AppInput
        v-model="memo"
        v-bind="{
          placeholder: $t('portfolio.bankTransfer.memo.placeholder'),
          wrapperClass: 'mt-2'
        }"
      />
    </div>

    <p
      v-if="memoErrors.length > 0"
      class="first-letter:uppercase text-red-600 text-xs mt-1"
    >
      {{ memoErrors[0] }}
    </p>
  </div>
</template>
