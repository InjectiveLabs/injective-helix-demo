<script setup lang="ts">
import { DerivativesTradeFormField, derivativeMarketKey } from '@/types'

const { value: amount, errorMessage } = useStringField({
  name: DerivativesTradeFormField.Quantity,
  initialValue: ''
})

const market = inject(derivativeMarketKey)
</script>

<template>
  <div class="space-y-2">
    <p class="field-label">{{ $t('trade.amount') }}</p>

    <AppInputField v-model="amount" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market?.baseToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
