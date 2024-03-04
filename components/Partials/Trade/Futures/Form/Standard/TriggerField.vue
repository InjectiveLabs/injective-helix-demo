<script setup lang="ts">
import { derivativeMarketKey } from '@/types'

const trigger = ref('')

const market = inject(derivativeMarketKey)
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

    <div v-if="false" class="error-message">Error Messagee</div>
  </div>
</template>
