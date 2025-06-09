<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: bypassPriceWarningValue } = useBooleanField({
  name: DerivativesTradeFormField.BypassPriceWarning,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox v-model="bypassPriceWarningValue" class="w-full text-white">
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox>
  </div>
</template>
