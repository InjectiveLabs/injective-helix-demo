<script setup lang="ts">
import { DerivativesTradeFormField, derivativeMarketKey } from '@/types'

const { value: limit, errorMessage } = useStringField({
  name: DerivativesTradeFormField.LimitPrice,
  initialValue: ''
})

const market = inject(derivativeMarketKey)
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField v-model="limit" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
