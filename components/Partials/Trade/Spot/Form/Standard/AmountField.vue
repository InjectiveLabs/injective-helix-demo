<script setup lang="ts">
import { spotMarketKey } from '@/types'

const amount = ref('')

const market = inject(spotMarketKey)
</script>

<template>
  <div class="space-y-2">
    <p class="text-xs font-semibold">Amount</p>

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
