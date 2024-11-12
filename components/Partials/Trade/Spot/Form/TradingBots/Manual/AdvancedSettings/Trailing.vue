<script setup lang="ts">
import { SpotGridTradingField } from '@/types'

const { value: isTrailingEnabled } = useBooleanField({
  name: SpotGridTradingField.IsTrailingEnabled,
  initialValue: false,
  rule: ''
})

const {
  value: trailingUpper,
  errorMessage: trailingUpperErrorMessage,
  resetField: resetTrailingUpperField
} = useStringField({
  name: SpotGridTradingField.TrailingUpper,
  rule: '',
  dynamicRule: computed(() => {
    if (!isTrailingEnabled.value) return ''

    return [
      'required',
      `greaterThanSgt:@${SpotGridTradingField.UpperPrice}`
    ].join('|')
  })
})

const {
  value: trailingLower,
  errorMessage: trailingLowerErrorMessage,
  resetField: resetTrailingLowerField
} = useStringField({
  name: SpotGridTradingField.TrailingLower,
  rule: '',
  dynamicRule: computed(() => {
    if (!isTrailingEnabled.value) return ''

    return ['required', `lessThanSgt:@${SpotGridTradingField.LowerPrice}`].join(
      '|'
    )
  })
})

const isEnabled = computed({
  get: () => isTrailingEnabled.value,
  set: (isEnabled) => {
    if (!isEnabled) {
      resetTrailingUpperField()
      resetTrailingLowerField()
    }

    isTrailingEnabled.value = isEnabled
  }
})
</script>

<template>
  <div class="p-1 space-y-2">
    <AppCheckbox2 v-model="isEnabled">
      {{ $t('sgt.enableTrailing') }}
    </AppCheckbox2>

    <div v-if="isTrailingEnabled" class="space-y-2">
      <AppInputField v-model="trailingUpper" :placeholder="$t('sgt.upper')" />
      <p v-if="trailingUpperErrorMessage" class="error-message mt-2">
        {{ trailingUpperErrorMessage }}
      </p>

      <AppInputField v-model="trailingLower" :placeholder="$t('sgt.lower')" />
      <p v-if="trailingLowerErrorMessage" class="error-message mt-2">
        {{ trailingLowerErrorMessage }}
      </p>
    </div>
  </div>
</template>
