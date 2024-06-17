<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: bypassPriceWarningValue } = useBooleanField({
  name: DerivativesTradeFormField.BypassPriceWarning,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox2 v-model="bypassPriceWarningValue" class="w-full">
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox2>
  </div>
</template>
