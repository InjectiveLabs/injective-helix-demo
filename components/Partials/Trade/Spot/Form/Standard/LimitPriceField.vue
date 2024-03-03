<script setup lang="ts">
import { spotMarketKey } from '@/types'

const limit = ref('')

const market = inject(spotMarketKey)
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="text-xs font-semibold">Limit Price</p>

    <AppInputField v-model="limit" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="false" class="error-message">Error Messagee</div>
  </div>
</template>
