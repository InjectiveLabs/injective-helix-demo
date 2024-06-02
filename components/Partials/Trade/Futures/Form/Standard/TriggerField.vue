<script setup lang="ts">
import { DerivativesTradeFormField, DerivativeMarketKey } from '@/types'

const { value: trigger, errorMessage } = useStringField({
  name: DerivativesTradeFormField.TriggerPrice,
  initialValue: ''
})

const market = inject(DerivativeMarketKey)
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.trigger_price') }}</p>

    <AppInputField v-model="trigger" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
