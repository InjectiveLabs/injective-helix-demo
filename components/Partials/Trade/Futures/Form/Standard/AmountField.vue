<script setup lang="ts">
import { derivativeMarketKey } from '@/types'

const amount = ref('')

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

    <div v-if="false" class="error-message">Error Messagee</div>
  </div>
</template>
