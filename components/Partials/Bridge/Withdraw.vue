<script setup lang="ts">
import { BINANCE_DEPOSIT_ADDRESSES } from '@/app/utils/constants'
import { BridgeForm, BridgeField } from '@/types'

const formValues = useFormValues<BridgeForm>()

const memoRequired = ref(false)

const { isWithdraw, destinationIsInjective } = useBridgeState(formValues)

const { value: destination, errors: destinationErrors } = useStringField({
  name: BridgeField.Destination,
  rule: '',
  dynamicRule: computed(() =>
    isWithdraw.value && destinationIsInjective.value
      ? 'required|injAddress'
      : ''
  )
})

const { value: memo, resetField: resetMemo } = useStringField({
  name: BridgeField.Memo,
  rule: '',
  dynamicRule: computed(() => {
    return memoRequired.value ? 'required' : ''
  })
})

watch(destination, (value: string) => {
  if (BINANCE_DEPOSIT_ADDRESSES.includes(value)) {
    memoRequired.value = true
  } else {
    formValues.value[BridgeField.Memo] = ''
    memoRequired.value = false
  }
})
</script>

<template>
  <div class="mt-6">
    <div v-if="isWithdraw && destinationIsInjective" class="mb-4">
      <div class="mt-6">
        <AppInput
          v-model="destination"
          clear-on-paste
          :label="$t('bridge.injAddress')"
          placeholder="inj"
          wrapper-classes="py-2 px-1"
          data-cy="transfer-modal-inj-address-input"
        />

        <p
          v-if="destinationErrors.length > 0"
          class="text-red-500 text-xs mt-1"
        >
          {{ destinationErrors[0] }}
        </p>
      </div>
      <div class="my-4 w-full">
        <div class="flex items-center justify-between text-gray-200">
          <CommonInfoTooltip :tooltip="$t('memo.memoTooltip')">
            <span class="text-xs flex items-center">
              {{ $t('memo.memo') }}
              <BaseIcon name="circle-info" class="text-gray-500 w-3 h-3 ml-2" />
            </span>
          </CommonInfoTooltip>

          <AppCheckbox v-model="memoRequired" @input="resetMemo">
            {{ $t('common.required') }}
          </AppCheckbox>
        </div>
        <div v-if="memoRequired" class="mt-2">
          <AppInput
            v-model="memo"
            wrapper-classes="py-2 px-1"
            :placeholder="$t('memo.memoPlaceholder')"
          />
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
