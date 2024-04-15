<script setup lang="ts">
import { SpotTradeFormField, spotMarketKey } from '@/types'

const { value: limitValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Price,
  initialValue: ''
})

const market = inject(spotMarketKey)
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField v-model="limitValue" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
